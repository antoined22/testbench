/* Génère une page /tests/<slug>/index.html par entrée de content/tests.json.
   Usage :  node scripts/build-tests.js
   La sortie est du HTML statique ordinaire : le déploiement GitHub Pages
   n'exécute jamais ce script. */
const fs = require('fs');
const path = require('path');
const S = require('./lib/shell');

const ROOT = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'tests.json'), 'utf8'));

const pct = (score) => Math.round(parseFloat(String(score).replace(',', '.')) * 10);
const dot = (score) => String(score).replace(',', '.');
const para = (arr, ind = '          ') =>
  (arr || []).map((p) => `${ind}<p>${p}</p>`).join('\n');
const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const list = (arr, ind = '              ') =>
  (arr || []).map((x) => `${ind}<li>${x}</li>`).join('\n');

/* Synthèse finale assemblée à partir des données de la fiche. Aucune phrase
   n'est inventée : note, rôle, premier point fort et premier point faible. */
function recap(t) {
  const bits = [
    `Le ${t.name} obtient <strong>${t.note}/10</strong>${t.noteProvisoire ? ', une note provisoire' : ''}.`,
  ];
  if (t.role) bits.push(`C'est, dans la gamme, ${lower(t.role)}.`);
  if (t.pros && t.pros.length) bits.push(`Son meilleur atout : ${lower(t.pros[0])}.`);
  if (t.cons && t.cons.length) bits.push(`Sa principale limite : ${lower(t.cons[0])}.`);
  return bits.join(' ');
}

/* Maillage interne : d'abord les modèles de la même marque, puis les autres. */
function related(t, all) {
  const others = all.filter((x) => x.slug !== t.slug);
  const same = others.filter((x) => x.brand === t.brand).slice(0, 3);
  const rest = others.filter((x) => x.brand !== t.brand).sort((a, b) => dot(b.note) - dot(a.note)).slice(0, 2);
  return same.concat(rest);
}

function productJsonLd(t) {
  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: t.name,
    brand: { '@type': 'Brand', name: t.brand },
    category: t.category,
    review: {
      '@type': 'Review',
      name: `${t.name} : ${t.tested ? 'test et avis' : 'avis et analyse'}`,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: dot(t.note),
        bestRating: '10',
        worstRating: '1',
      },
      author: { '@type': 'Organization', name: 'TestBench', url: S.SITE + '/' },
      datePublished: S.isoDate(t.date),
      reviewBody: S.plain(t.lead),
      url: `${S.SITE}/tests/${t.slug}/`,
    },
  };
  if (t.pros && t.pros.length) {
    product.review.positiveNotes = {
      '@type': 'ItemList',
      itemListElement: t.pros.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: S.plain(x) })),
    };
  }
  if (t.cons && t.cons.length) {
    product.review.negativeNotes = {
      '@type': 'ItemList',
      itemListElement: t.cons.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: S.plain(x) })),
    };
  }
  // Pas d'aggregateRating : une seule évaluation éditoriale, pas d'agrégat.
  // Pas d'offers : aucun prix n'est relevé pour l'instant.
  return product;
}

function page(t, all) {
  const kind = t.tested ? 'test et avis' : 'avis et analyse';
  const title = `${t.name} : ${kind} | TestBench`;
  const slugBrand = t.brand.toLowerCase();

  const bc = S.breadcrumb(
    [
      { name: 'Accueil', path: '' },
      { name: 'Tests', path: 'tests/' },
      { name: t.brand, path: 'tests/#' + slugBrand },
      { name: t.name, path: `tests/${t.slug}/` },
    ],
    2
  );

  const sections = (t.sections || [])
    .map((s) => {
      const sub = (s.subsections || [])
        .map((ss) => `\n          <h3>${ss.title}</h3>\n${para(ss.paragraphs)}`)
        .join('');
      const call = s.callout
        ? `\n          <div class="callout">
            <span class="callout__label">À retenir</span>
            <p>${s.callout}</p>
          </div>`
        : '';
      return `
          <h2>${s.title}${s.score ? ` <span class="crit-score">${s.score}/10</span>` : ''}</h2>
${para(s.paragraphs)}${sub}${call}`;
    })
    .join('\n');

  /* Rappel marchand en cours d'article. Il pointe directement sur l'offre :
     un bouton « Voir le prix » qui se contenterait de faire défiler la page
     vers l'encadré latéral ne tient pas sa promesse. */
  const firstOffer = (t.affiliate || [])[0];
  const inlineCta = firstOffer
    ? `
          <div class="glass cta-inline">
            <p><strong>Vous envisagez ce modèle&nbsp;?</strong><br>Son prix bouge souvent, vérifiez l'offre du jour.</p>
            <a class="btn btn--primary" href="${firstOffer.url}" rel="sponsored nofollow noopener" target="_blank">
              Voir le prix sur ${firstOffer.merchant} <span aria-hidden="true">↗</span>
            </a>
          </div>`
    : '';

  const audience =
    t.audienceFor || t.audienceNot || t.audience
      ? `
          <h2>Pour qui ce robot est-il adapté&nbsp;?</h2>
${
  t.audience
    ? (t.audience.intro ? `          <p>${t.audience.intro}</p>\n` : '') +
      (t.audience.items
        ? `          <ul>\n${list(t.audience.items, '            ')}\n          </ul>`
        : para(t.audience.paragraphs))
    : `          <p>Il convient à&nbsp;:</p>
          <ul>
${list(t.audienceFor, '            ')}
          </ul>`
}
${
  t.audienceNot
    ? `
          <h3>Pour qui il n'est pas adapté</h3>
          <ul>
${list(t.audienceNot, '            ')}
          </ul>`
    : ''
}`
      : '';

  const warning = t.warning
    ? `
          <div class="callout callout--warn">
            <span class="callout__label">Note provisoire</span>
            <p>${t.warning}</p>
          </div>`
    : '';

  const notCovered = t.notCovered && t.notCovered.length
    ? `
          <h2>Ce que cet avis ne couvre pas</h2>
          <p>Par honnêteté, voici les points sur lesquels nous n'avons pas de mesure à vous donner
          aujourd'hui&nbsp;: ${t.notCovered.join(', ')}. Ces sections seront complétées si nous obtenons
          des données fiables.</p>`
    : '';

  const subscores = (t.criteria || [])
    .map(
      (c) => `            <div class="subscore">
              <div class="subscore__head"><span>${c.label}</span><b>${c.score}</b></div>
              <div class="bar"><i style="width:${pct(c.score)}%"></i></div>
            </div>`
    )
    .join('\n');

  const specs = (t.specs || [])
    .map(([k, v]) => `                <tr><th scope="row">${k}</th><td>${v}</td></tr>`)
    .join('\n');

  const rel = related(t, all);
  const relatedBlock = `
          <h2>À lire aussi</h2>
          <ul class="related">
            <li><a href="../../meilleur-robot-aspirateur/">Notre classement des meilleurs robots aspirateurs</a></li>
${rel
  .map(
    (r) =>
      `            <li><a href="../${r.slug}/">${r.tested ? 'Notre test du' : 'Notre avis sur le'} ${r.name}</a> — ${r.note}/10</li>`
  )
  .join('\n')}
            <li><a href="../../methodologie/">Comment nous évaluons les robots aspirateurs</a></li>
          </ul>`;

  /* Bloc marchands. Un lien mort dégrade l'expérience et le référencement :
     on n'affiche que les marchands pour lesquels un lien existe réellement. */
  const merchants = t.affiliate || [];
  const hasAmazon = merchants.some((m) => /amazon/i.test(m.merchant));
  const buyBox = merchants.length
    ? `          <p class="buy-box__note">Nous ne relevons pas les prix : ils changent trop vite.
          Le lien vous emmène sur l'offre du jour.</p>

          <div class="merchant-list">
${merchants
  .map(
    (m, i) => `            <a class="merchant${i === 0 ? ' merchant--best' : ''}" href="${m.url}" rel="sponsored nofollow noopener" target="_blank">
              <span>
                <span class="merchant__name">${m.merchant}</span><br>
                <span class="merchant__meta">${m.note || 'Voir la fiche produit'}</span>
              </span>
              <span class="merchant__cta">Voir le prix →</span>
            </a>`
  )
  .join('\n')}
          </div>

          <p class="affiliate-note">
            ${hasAmazon ? "En tant que Partenaire Amazon, TestBench réalise un bénéfice sur les achats remplissant les conditions requises. " : ''}Ces liens sont des liens affiliés : un achat effectué après avoir cliqué peut rapporter
            une commission à TestBench, <strong>sans surcoût pour vous</strong>. Cela ne change ni la note
            ni le contenu de l'avis. <a href="../../a-propos/#affiliation">En savoir plus</a>.
          </p>`
    : `          <p class="buy-box__note">Nous n'avons pas encore de lien marchand pour ce modèle.
          Cette section sera complétée&nbsp;; en attendant, rien ne vous est proposé à l'achat ici.</p>
          <p class="affiliate-note">
            Quand des liens marchands seront ajoutés, ce seront des liens affiliés, signalés comme tels.
            <a href="../../a-propos/#affiliation">Notre fonctionnement</a>.
          </p>`;

  const media = t.image
    ? `<img src="../../assets/img/${t.image.file}" alt="${S.esc(t.image.alt)}" width="1200" height="750" loading="lazy" decoding="async">`
    : `<span class="card__placeholder">Photo à venir</span>`;

  const badge = t.tested
    ? `<span class="tag tag--tested"><span class="dot"></span> Testé par TestBench</span>`
    : `<span class="tag tag--analysis">Analyse — non testé par nos soins</span>`;

  const body = `${S.header(2)}

<main id="main">
${bc.html}

  <section class="review-hero">
    <div class="wrap">
      ${badge}
      <h1>${t.name} : ${kind}</h1>
      <div class="review-hero__meta">
        <span>Publié le <strong>${t.date}</strong></span>
        <span>Note&nbsp;: <strong>${t.note}/10${t.noteProvisoire ? ' (provisoire)' : ''}</strong></span>
${
  t.tested
    ? `        <span>Durée du test&nbsp;: <strong>${t.testDuration}</strong></span>
        <span>Conditions&nbsp;: <strong>${t.testConditions}</strong></span>`
    : `        <span>Sources&nbsp;: <strong>essais indépendants publiés et données constructeur</strong></span>`
}
      </div>
      <p class="review-hero__lead">${t.lead}</p>
${
  t.tested
    ? ''
    : `      <p class="disclosure">Nous n'avons pas eu ce modèle entre les mains. Cet avis synthétise les
      essais indépendants publiés et les caractéristiques annoncées par le constructeur.
      <a href="../../methodologie/">Voir notre méthodologie</a>.</p>`
}
    </div>
  </section>

  <div class="wrap">
    <div class="review-layout">
      <div>
        <section class="essentials">
          <h2 class="sr-only">L'essentiel</h2>
          <div class="verdict-grid">
            <div class="glass pros-cons pros">
              <h3>Points forts</h3>
              <ul>
${list(t.pros)}
              </ul>
            </div>
            <div class="glass pros-cons cons">
              <h3>Points faibles</h3>
              <ul>
${list(t.cons)}
              </ul>
            </div>
          </div>
        </section>

        <article class="prose">
          <h2>Notre verdict</h2>
${para(t.verdict)}
${sections.split('\n          <h2>').slice(0, 2).join('\n          <h2>')}
${inlineCta}
${sections.split('\n          <h2>').length > 2 ? '\n          <h2>' + sections.split('\n          <h2>').slice(2).join('\n          <h2>') : ''}
${audience}
${warning}
${notCovered}
          <h2>Fiche technique</h2>
          <div class="table-wrap">
            <table class="specs">
              <caption class="sr-only">Caractéristiques du ${t.name}</caption>
              <tbody>
${specs}
              </tbody>
            </table>
          </div>

          <h2>Prix</h2>
          <p>Nous ne relevons pas de prix constaté en France pour ce modèle : il change trop souvent
          pour qu'un chiffre figé ici vous soit utile.${
            (t.affiliate || []).length
              ? " Les liens marchands renvoient vers l'offre du jour."
              : " Aucun lien marchand n'est proposé pour l'instant."
          }</p>
${relatedBlock}

          <div class="glass final-verdict" id="verdict">
            <h2>Verdict final</h2>
            <p>${recap(t)}</p>
${t.closing ? `            <p>${t.closing}</p>` : ''}
          </div>
        </article>
      </div>

      <aside class="sticky-side">

        <div class="glass score-card">
          <div class="score-ring" style="--value:${pct(t.note)}">
            <div class="score-ring__val">${t.note}<sub>/10</sub></div>
          </div>
          <div class="score-card__label">Note TestBench${t.noteProvisoire ? ' · provisoire' : ''}</div>

          <div class="subscores">
${subscores}
          </div>
        </div>

        <!-- ▼ EMPLACEMENT AFFILIATION — bloc marchands ▼ -->
        <div class="glass buy-box" id="ou-acheter">
          <h2>Où l'acheter</h2>
${buyBox}
        </div>
        <!-- ▲ FIN EMPLACEMENT AFFILIATION ▲ -->

      </aside>
    </div>
  </div>
</main>

${S.footer(2)}`;

  return S.document_({
    head: S.head({
      title,
      description: t.description || S.plain(t.lead),
      path: `/tests/${t.slug}/`,
      image: `/assets/img/og-${t.slug}.png`,
      depth: 2,
      type: 'article',
      jsonld: [productJsonLd(t), bc.jsonld],
    }),
    body,
  });
}

for (const t of data.tests) {
  const dir = path.join(ROOT, 'tests', t.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(t, data.tests));
  console.log('écrit tests/' + t.slug + '/index.html');
}
