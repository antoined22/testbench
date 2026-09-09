/* Génère une page /tests/<slug>/index.html par entrée de content/tests.json.
   Usage :  node scripts/build-tests.js
   Les pages produites sont du HTML statique ordinaire : le site reste
   consultable et déployable sans ce script. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://antoined22.github.io/testbench';
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'tests.json'), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pct = (score) => Math.round(parseFloat(String(score).replace(',', '.')) * 10);
const para = (arr) => (arr || []).map((p) => `          <p>${p}</p>`).join('\n');
const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);

/* Synthèse finale, assemblée à partir des données de la fiche : note, rôle
   dans la gamme, premier point fort et premier point faible. Aucune phrase
   n'est inventée, elles reprennent le texte du test. */
function recap(t) {
  const bits = [
    `Le ${t.name} obtient <strong>${t.note}/10</strong>${t.noteProvisoire ? ', une note provisoire' : ''}.`,
  ];
  if (t.role) bits.push(`C'est, dans la gamme, ${lower(t.role)}.`);
  if (t.pros && t.pros.length) bits.push(`Son meilleur atout : ${lower(t.pros[0])}.`);
  if (t.cons && t.cons.length) bits.push(`Sa principale limite : ${lower(t.cons[0])}.`);
  return bits.join(' ');
}

function page(t) {
  const title = `${t.name} : notre avis complet`;
  const url = `${SITE}/tests/${t.slug}/`;
  const img = `${SITE}/assets/img/og-${t.slug}.png`;
  const share = t.lead;

  const sections = (t.criteria || [])
    .filter((c) => c.paragraphs && c.paragraphs.length)
    .map((c) => `
          <h2>${c.label} <span class="crit-score">${c.score}/10</span></h2>
${para(c.paragraphs)}`)
    .join('\n');

  const prosCons = (t.pros || t.cons)
    ? `
        <div class="verdict-grid">
          <div class="glass pros-cons pros">
            <h3>Points forts</h3>
            <ul>
${(t.pros || []).map((x) => `              <li>${x}</li>`).join('\n')}
            </ul>
          </div>
          <div class="glass pros-cons cons">
            <h3>Points faibles</h3>
            <ul>
${(t.cons || []).map((x) => `              <li>${x}</li>`).join('\n')}
            </ul>
          </div>
        </div>
`
    : '';

  const audience = t.audience
    ? `
          <h2>${t.audience.title}</h2>
${t.audience.intro ? `          <p>${t.audience.intro}</p>\n` : ''}${
        t.audience.items
          ? `          <ul>\n${t.audience.items.map((i) => `            <li>${i}</li>`).join('\n')}\n          </ul>`
          : para(t.audience.paragraphs)
      }`
    : '';

  const warning = t.warning
    ? `
          <div class="callout callout--warn">
            <span class="callout__label">Note provisoire</span>
            <p>${t.warning}</p>
          </div>`
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

  return `<!DOCTYPE html>
<!-- Page générée par scripts/build-tests.js depuis content/tests.json.
     Modifier le JSON puis relancer le script plutôt que ce fichier. -->
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(t.description || t.lead)}">
<link rel="canonical" href="${url}">

<meta property="og:type" content="article">
<meta property="og:site_name" content="TestBench">
<meta property="og:locale" content="fr_FR">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(share)}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.name)} sur TestBench, noté ${t.note} sur 10">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(share)}">
<meta name="twitter:image" content="${img}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/css/style.css">
</head>
<body>
<div class="aurora"></div>
<div class="grid-overlay"></div>

<a class="skip-link" href="#main">Aller au contenu</a>

<header class="site-header">
  <div class="wrap site-header__inner">
    <a class="brand" href="../../">
      <span class="brand__mark" aria-hidden="true">T</span>
      <span class="brand__name">Test<span>Bench</span></span>
    </a>
    <nav class="nav" aria-label="Navigation principale">
      <a href="../../">Accueil</a>
      <a href="../../#tests">Tests</a>
      <a href="../../#methode">Méthode</a>
    </nav>
  </div>
</header>

<main id="main">
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Fil d'ariane">
      <a href="../../">Accueil</a><span>/</span><a href="../../#tests">Robots aspirateurs</a><span>/</span>${t.name}
    </nav>
  </div>

  <section class="review-hero">
    <div class="wrap">
      <span class="tag tag--accent"><span class="dot"></span> ${t.category}${t.role ? ' · ' + t.role : ''}</span>
      <h1>${t.name} : notre avis complet</h1>
      <div class="review-hero__meta">
        <span>Publié le <strong>${t.date}</strong></span>
        <span>Note&nbsp;: <strong>${t.note}/10${t.noteProvisoire ? ' (provisoire)' : ''}</strong></span>
        <span>Catégorie&nbsp;: <strong>${t.category.toLowerCase()} haut de gamme</strong></span>
      </div>
      <p class="review-hero__lead">${t.lead}</p>
    </div>
  </section>

  <div class="wrap">
    <div class="review-layout">
      <div>
${prosCons}
        <article class="prose">
${para(t.verdict)}
${sections}
${audience}
${warning}
          <h2>Fiche technique</h2>
          <div class="table-wrap">
            <table class="specs">
              <tbody>
${specs}
              </tbody>
            </table>
          </div>

          <div class="glass final-verdict" id="verdict">
            <h2>En résumé</h2>
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
          <div class="score-card__label">Note globale TestBench${t.noteProvisoire ? ' · provisoire' : ''}</div>

          <div class="subscores">
${subscores}
          </div>
        </div>

        <!-- ▼ EMPLACEMENT AFFILIATION — bloc marchands ▼ -->
        <div class="glass buy-box" id="ou-acheter">
          <h3>Où l'acheter</h3>
          <p class="buy-box__note">Prix relevés manuellement, susceptibles d'avoir changé.</p>

          <div class="merchant-list">
            <a class="merchant merchant--best" href="#" rel="sponsored nofollow noopener" target="_blank">
              <span>
                <span class="merchant__name">Amazon</span><br>
                <span class="merchant__meta">Prix à compléter · livraison rapide</span>
              </span>
              <span class="merchant__cta">Voir l'offre →</span>
            </a>

            <a class="merchant" href="#" rel="sponsored nofollow noopener" target="_blank">
              <span>
                <span class="merchant__name">Roborock (site officiel)</span><br>
                <span class="merchant__meta">Prix à compléter · garantie constructeur</span>
              </span>
              <span class="merchant__cta">Voir l'offre →</span>
            </a>

            <a class="merchant" href="#" rel="sponsored nofollow noopener" target="_blank">
              <span>
                <span class="merchant__name">Autre marchand</span><br>
                <span class="merchant__meta">Prix à compléter</span>
              </span>
              <span class="merchant__cta">Voir l'offre →</span>
            </a>
          </div>

          <p class="affiliate-note">
            Liens affiliés : un achat via ces liens peut rapporter une commission à TestBench, sans surcoût
            pour vous. Cela ne change ni la note ni le contenu du test.
          </p>
        </div>
        <!-- ▲ FIN EMPLACEMENT AFFILIATION ▲ -->

      </aside>
    </div>
  </div>
</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="site-footer__inner">
      <div>
        <a class="brand" href="../../">
          <span class="brand__mark" aria-hidden="true">T</span>
          <span class="brand__name">Test<span>Bench</span></span>
        </a>
        <p>Tests produits indépendants, écrits après plusieurs semaines d'utilisation réelle.</p>
      </div>
      <nav aria-label="Liens de bas de page">
        <a href="../../">Accueil</a>
        <a href="../../#tests">Tests</a>
        <a href="../../#methode">Méthode</a>
      </nav>
    </div>
    <p class="legal">
      Certains liens de cette page sont des liens affiliés : si vous achetez via ces liens, TestBench peut
      percevoir une commission, sans surcoût pour vous. Cela n'influence ni les notes ni le contenu des tests.
      © 2026 TestBench.
    </p>
  </div>
</footer>

</body>
</html>
`;
}

for (const t of data.tests) {
  const dir = path.join(ROOT, 'tests', t.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(t));
  console.log('écrit tests/' + t.slug + '/index.html');
}
