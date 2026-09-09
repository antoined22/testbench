/* Génère les pages éditoriales du site (hub tests, pilier, méthodologie,
   à propos, pages légales, 404) à partir de content/tests.json.
   Usage :  node scripts/build-pages.js */
const fs = require('fs');
const path = require('path');
const S = require('./lib/shell');

const ROOT = path.join(__dirname, '..');
const tests = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'tests.json'), 'utf8')).tests;

const num = (s) => parseFloat(String(s).replace(',', '.'));
const byNote = [...tests].sort((a, b) => num(b.note) - num(a.note));
const crit = (t, label) => (t.criteria || []).find((c) => c.label.toLowerCase().includes(label.toLowerCase()));
const best = (label) =>
  tests
    .filter((t) => crit(t, label))
    .sort((a, b) => num(crit(b, label).score) - num(crit(a, label).score))[0];

function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log('écrit ' + rel);
}

const card = (t, depth) => `
        <article class="glass card">
          <div class="card__media">
            <span class="card__placeholder">Photo à venir</span>
            <div class="card__score">${t.note}<span>/10</span></div>
          </div>
          <div class="card__body">
            <span class="card__cat">${t.brand}</span>
            <h3 class="card__title">
              <a href="${S.up(depth)}tests/${t.slug}/">${t.name}</a>
            </h3>
            <p class="card__excerpt">${t.lead}</p>
            <div class="card__foot">
              <span>${t.tested ? 'Testé par TestBench' : 'Analyse'}</span>
              <a class="card__link" href="${S.up(depth)}tests/${t.slug}/">${t.tested ? 'Lire le test' : "Lire l'avis"}</a>
            </div>
          </div>
        </article>`;

/* ----------------------------------------------------------- /tests/ ----- */
{
  const brands = [...new Set(tests.map((t) => t.brand))];
  const bc = S.breadcrumb([{ name: 'Accueil', path: '' }, { name: 'Tests', path: 'tests/' }], 1);
  const body = `${S.header(1, 'tests')}

<main id="main">
${bc.html}

  <section class="hero hero--page">
    <div class="wrap">
      <span class="tag tag--accent"><span class="dot"></span> ${tests.length} avis publiés</span>
      <h1>Tous nos tests et avis de robots aspirateurs</h1>
      <p class="hero__lead">Chaque fiche indique clairement si le robot a été utilisé chez nous
      ou s'il s'agit d'une analyse à partir des essais indépendants publiés. Les notes, les points
      forts et les vraies limites sont détaillés dans chaque avis.</p>
      <p><a class="btn" href="../methodologie/">Comment nous évaluons</a></p>
    </div>
  </section>

${brands
  .map((b) => {
    const list = tests.filter((t) => t.brand === b).sort((x, y) => num(y.note) - num(x.note));
    return `  <section class="section section--tight" id="${b.toLowerCase()}">
    <div class="wrap">
      <div class="section-head">
        <div>
          <span class="tag">${b}</span>
          <h2>Nos avis sur les robots ${b}</h2>
          <p>${list.length} modèle${list.length > 1 ? 's' : ''} couvert${list.length > 1 ? 's' : ''}.</p>
        </div>
      </div>
      <div class="cards">
${list.map((t) => card(t, 1)).join('\n')}
      </div>
    </div>
  </section>`;
  })
  .join('\n\n')}
</main>

${S.footer(1)}`;

  write(
    'tests/index.html',
    S.document_({
      head: S.head({
        title: 'Tests et avis de robots aspirateurs | TestBench',
        description:
          "Tous nos avis de robots aspirateurs Dreame et Roborock : notes détaillées, points forts et vraies limites, avec la source de chaque évaluation.",
        path: '/tests/',
        depth: 1,
        jsonld: [bc.jsonld],
      }),
      body,
    })
  );
}

/* ------------------------------------ /meilleur-robot-aspirateur/ -------- */
{
  const top = byNote[0];
  const value = tests.find((t) => t.role && t.role.includes('rapport'));
  const pets = best("Poils d'animaux") || best('animal');
  const wash = best('Lavage');
  const premium = tests.find((t) => t.role && t.role.includes('global')) || top;
  const nbTestes = tests.filter((t) => t.tested).length;

  const faq = [
    {
      q: 'Quel est le meilleur robot aspirateur selon TestBench ?',
      a: `Sur les ${tests.length} modèles que nous avons évalués, le ${top.name} obtient la note la plus élevée, ${top.note}/10. ${
        top.tested
          ? 'Nous l\'avons utilisé nous-mêmes pendant plusieurs semaines.'
          : "C'est une analyse documentaire, pas un test physique."
      }`,
    },
    {
      q: 'Quel robot aspirateur choisir quand on a un chat ?',
      a: `Le point décisif n'est pas la puissance mais l'entretien. Notre test du Dreame Aqua10 Ultra Roller Complete montre qu'un robot performant peut devenir contraignant si son rouleau et son entrée d'aspiration se bouchent avec les poils et doivent être nettoyés à la main. Regardez d'abord le système anti-emmêlement et la facilité de nettoyage des pièces.`,
    },
    {
      q: 'Faut-il choisir son robot sur la puissance en Pa ?',
      a: `Non. Dans cette catégorie de prix, la navigation, le lavage, la gestion des cheveux, la qualité de la station et la capacité à fonctionner sans intervention humaine sont au moins aussi importantes. Un robot légèrement moins puissant sur le papier mais capable de bien naviguer, de ne pas se bloquer et de maintenir correctement ses serpillières peut être beaucoup plus agréable au quotidien.`,
    },
    {
      q: 'Un robot aspirateur lave-t-il vraiment le sol ?',
      a: `Pour l'entretien courant, oui : les traces légères et les saletés fraîches sont bien prises en charge par les modèles récents. Pour des taches sèches ou incrustées, plusieurs passages restent souvent nécessaires.`,
    },
  ];

  const rows = byNote
    .map(
      (t) => `              <tr>
                <th scope="row"><a href="../tests/${t.slug}/">${t.name}</a></th>
                <td>${(crit(t, 'Aspiration') || {}).score || '—'}</td>
                <td>${(crit(t, 'Lavage') || {}).score || '—'}</td>
                <td>${(crit(t, 'Navigation') || {}).score || '—'}</td>
                <td><strong>${t.note}${t.noteProvisoire ? '*' : ''}</strong></td>
                <td>${t.tested ? 'Testé' : 'Analyse'}</td>
              </tr>`
    )
    .join('\n');

  const pick = (t, titre, pourquoi) =>
    t
      ? `      <h2>${titre}</h2>
      <p><a href="../tests/${t.slug}/"><strong>${t.name}</strong></a> — ${t.note}/10. ${pourquoi}</p>`
      : '';

  const bc = S.breadcrumb(
    [{ name: 'Accueil', path: '' }, { name: 'Meilleur robot aspirateur', path: 'meilleur-robot-aspirateur/' }],
    1
  );

  const body = `${S.header(1, 'meilleur')}

<main id="main">
${bc.html}

  <section class="hero hero--page">
    <div class="wrap">
      <span class="tag tag--accent"><span class="dot"></span> Mis à jour en septembre 2026</span>
      <h1>Meilleur robot aspirateur 2026 : notre classement</h1>
      <p class="hero__lead">Ce classement ne couvre que les ${tests.length} modèles que nous avons évalués.
      ${nbTestes} ${nbTestes > 1 ? 'ont été utilisés' : 'a été utilisé'} chez nous&nbsp;; les autres sont des
      analyses des essais indépendants publiés. Nous préférons un classement court et honnête à une liste
      exhaustive de produits jamais examinés.</p>
    </div>
  </section>

  <div class="wrap">
    <article class="prose prose--wide">

      <h2>Notre classement</h2>
      <div class="table-wrap">
        <table class="specs ranking">
          <caption class="sr-only">Classement des robots aspirateurs évalués par TestBench</caption>
          <thead>
            <tr><th scope="col">Modèle</th><th scope="col">Aspiration</th><th scope="col">Lavage</th>
            <th scope="col">Navigation</th><th scope="col">Note</th><th scope="col">Source</th></tr>
          </thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </div>
      <p class="table-note">* Note provisoire : modèle trop récent pour disposer du même recul que les autres.</p>

${pick(premium, 'Meilleur robot aspirateur', "C'est le modèle qui combine les meilleures notes sur l'ensemble des critères que nous suivons.")}
${pick(value, 'Meilleur rapport technologie/prix', "Il n'affiche pas les chiffres les plus impressionnants sur le papier, mais son équilibre général est excellent, en particulier sur la navigation.")}
${pick(pets, "Meilleur robot pour les poils d'animaux", "C'est le seul modèle de notre sélection pour lequel nous notons spécifiquement la gestion des poils d'animaux, grâce à ses brosses anti-emmêlement. À l'inverse, notre test du Dreame Aqua10 montre qu'un robot peut très bien aspirer les poils tout en imposant un nettoyage manuel pénible.")}
${pick(wash, 'Meilleur robot pour le lavage', "C'est la meilleure sous-note de lavage de notre sélection.")}

      <h2>Meilleur robot aspirateur à moins de 500 €</h2>
      <p>Nous ne relevons pas encore les prix, et aucun des modèles évalués ne se situe dans cette gamme.
      Cette section sera complétée lorsque nous aurons couvert des robots d'entrée et de milieu de gamme.</p>

      <h2>Comment choisir son robot aspirateur ?</h2>
      <p>Ne choisissez pas uniquement votre robot sur la puissance d'aspiration annoncée en Pa.
      Dans cette catégorie de prix, la navigation, le lavage, la gestion des cheveux, la qualité de la
      station et la capacité à fonctionner sans intervention humaine sont au moins aussi importantes.</p>
      <p>Un robot légèrement moins puissant sur le papier mais capable de bien naviguer, de ne pas se
      bloquer et de maintenir correctement ses serpillières peut être beaucoup plus agréable au quotidien.</p>

      <h3>Avec un animal à la maison</h3>
      <p>C'est le cas où l'entretien pèse le plus lourd. Notre
      <a href="../tests/dreame-aqua10-ultra-roller-complete/">test du Dreame Aqua10 Ultra Roller Complete</a>
      montre qu'un robot peut très bien aspirer tout en devenant pénible au quotidien, parce que son
      rouleau et son entrée d'aspiration se bouchent avec les poils et se nettoient à la main.</p>

      <h2>Notre méthode</h2>
      <p>Nous notons chaque robot sur des critères identiques et nous indiquons systématiquement si le
      modèle a été utilisé chez nous ou seulement analysé.
      <a href="../methodologie/">Lire notre méthodologie complète</a>.</p>

      <h2>Questions fréquentes</h2>
${faq
  .map(
    (f) => `      <h3>${f.q}</h3>
      <p>${f.a}</p>`
  )
  .join('\n')}

      <h2>Tous nos avis</h2>
      <ul class="related">
${byNote.map((t) => `        <li><a href="../tests/${t.slug}/">${t.name}</a> — ${t.note}/10 · ${t.tested ? 'testé' : 'analyse'}</li>`).join('\n')}
      </ul>
    </article>
  </div>
</main>

${S.footer(1)}`;

  write(
    'meilleur-robot-aspirateur/index.html',
    S.document_({
      head: S.head({
        title: 'Meilleur robot aspirateur 2026 : notre classement | TestBench',
        description:
          "Notre classement des robots aspirateurs que nous avons réellement évalués : notes détaillées, meilleur choix global, poils d'animaux, lavage, et comment choisir.",
        path: '/meilleur-robot-aspirateur/',
        depth: 1,
        type: 'article',
        jsonld: [
          bc.jsonld,
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: S.plain(f.a) },
            })),
          },
        ],
      }),
      body,
    })
  );
}

/* ------------------------------------------------- /methodologie/ -------- */
{
  const bc = S.breadcrumb([{ name: 'Accueil', path: '' }, { name: 'Méthodologie', path: 'methodologie/' }], 1);
  const criteres = [
    ['Aspiration', "Capacité à récupérer poussières, miettes et débris sur sols durs et sur tapis."],
    ['Lavage', "Efficacité sur les traces fraîches et sur les saletés sèches, pression appliquée, technologie employée."],
    ['Navigation', "Qualité de la cartographie, détection et évitement des obstacles, franchissement des seuils, passage sous les meubles."],
    ["Poils d'animaux", "Comportement des brosses face aux cheveux et aux poils : enroulement, bourrage, fréquence des interventions."],
    ['Station', "Ce que la station prend en charge seule : vidage, lavage des serpillières, séchage, entretien."],
    ['Entretien', "Ce qui reste à faire à la main, et à quelle fréquence. C'est le critère qui pèse le plus dans la durée."],
    ['Bruit', "Niveau sonore en usage réel. Nous ne le notons que si nous avons pu le constater nous-mêmes."],
    ['Autonomie', "Surface couverte par charge. Non noté tant que nous n'avons pas de mesure fiable."],
    ['Rapport qualité/prix', "Rapporté au prix constaté en France. Non noté tant que nous ne relevons pas les prix."],
  ];
  const body = `${S.header(1, 'methodologie')}

<main id="main">
${bc.html}

  <section class="hero hero--page">
    <div class="wrap">
      <span class="tag tag--accent"><span class="dot"></span> Transparence</span>
      <h1>Notre méthodologie</h1>
      <p class="hero__lead">Comment TestBench évalue les robots aspirateurs, ce que recouvre chaque note,
      et surtout la différence entre un robot que nous avons utilisé et un robot que nous avons seulement analysé.</p>
    </div>
  </section>

  <div class="wrap">
    <article class="prose prose--wide">

      <h2>Deux types de contenus, jamais confondus</h2>
      <p>C'est la distinction la plus importante du site, et elle est signalée en haut de chaque fiche
      par un badge&nbsp;:</p>

      <h3>Testé par TestBench</h3>
      <p>Le robot a été installé chez nous et utilisé au quotidien pendant plusieurs semaines, dans un
      logement réellement occupé. Nous indiquons la durée du test et les conditions (type de sol,
      présence d'un animal). Ces fiches contiennent des observations de première main, y compris les
      défauts qui n'apparaissent qu'à l'usage.</p>
      <p>Fiches concernées aujourd'hui&nbsp;:
${tests
  .filter((t) => t.tested)
  .map((t) => `      <a href="../tests/${t.slug}/">${t.name}</a>`)
  .join(', ')}.</p>

      <h3>Analyse</h3>
      <p>Le robot n'a pas été entre nos mains. La fiche synthétise les essais indépendants publiés et les
      caractéristiques annoncées par le constructeur. Nous le disons explicitement en haut de page, et la
      note engage notre lecture de ces sources, pas une mesure que nous aurions faite.</p>
      <p>Une note peut être marquée <strong>provisoire</strong> lorsqu'un modèle est trop récent pour que
      qui que ce soit dispose de recul sur sa fiabilité.</p>

      <h2>Nos critères d'évaluation</h2>
      <p>Chaque robot est noté sur 10, critère par critère. Une note n'est attribuée que si nous disposons
      d'un élément pour la justifier&nbsp;; sinon le critère est laissé de côté et la fiche l'indique.</p>
      <div class="table-wrap">
        <table class="specs">
          <caption class="sr-only">Critères d'évaluation de TestBench</caption>
          <tbody>
${criteres.map(([k, v]) => `            <tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('\n')}
          </tbody>
        </table>
      </div>

      <h2>Ce que nous ne faisons pas</h2>
      <ul>
        <li>Nous ne publions pas de test sponsorisé.</li>
        <li>Nous ne présentons jamais une analyse documentaire comme un test physique.</li>
        <li>Nous n'inventons ni prix, ni mesure, ni témoignage d'utilisateur.</li>
        <li>Nous ne notons pas un critère que nous n'avons pas les moyens d'évaluer.</li>
      </ul>

      <h2>Affiliation</h2>
      <p>Le site contient des liens affiliés. Ils n'interviennent jamais dans l'attribution des notes ni
      dans le contenu des avis. <a href="../a-propos/#affiliation">Voir le détail</a>.</p>

      <h2>À lire ensuite</h2>
      <ul class="related">
        <li><a href="../meilleur-robot-aspirateur/">Notre classement des meilleurs robots aspirateurs</a></li>
        <li><a href="../tests/">Tous nos avis de robots aspirateurs</a></li>
        <li><a href="../a-propos/">À propos de TestBench</a></li>
      </ul>
    </article>
  </div>
</main>

${S.footer(1)}`;

  write(
    'methodologie/index.html',
    S.document_({
      head: S.head({
        title: 'Notre méthodologie de test | TestBench',
        description:
          "Comment TestBench évalue les robots aspirateurs : les critères notés et la différence entre un robot testé chez nous et une analyse documentaire.",
        path: '/methodologie/',
        depth: 1,
        type: 'article',
        jsonld: [bc.jsonld],
      }),
      body,
    })
  );
}

/* ----------------------------------------------------- /a-propos/ -------- */
{
  const bc = S.breadcrumb([{ name: 'Accueil', path: '' }, { name: 'À propos', path: 'a-propos/' }], 1);
  const body = `${S.header(1)}

<main id="main">
${bc.html}

  <section class="hero hero--page">
    <div class="wrap">
      <span class="tag tag--accent"><span class="dot"></span> À propos</span>
      <h1>À propos de TestBench</h1>
      <p class="hero__lead">Un site d'avis sur les robots aspirateurs, qui dit toujours d'où vient
      l'information : usage réel à la maison, ou analyse des essais publiés.</p>
    </div>
  </section>

  <div class="wrap">
    <article class="prose prose--wide">

      <h2>Ce qu'est TestBench</h2>
      <p>TestBench publie des avis détaillés sur les robots aspirateurs. Le site est né d'un constat
      simple : la plupart des comparatifs en ligne alignent des fiches techniques sans jamais dire ce
      que le produit donne après plusieurs semaines d'usage, ni si l'auteur l'a seulement eu en main.</p>
      <p>Notre parti pris est donc double : écrire les défauts noir sur blanc, et indiquer sans ambiguïté
      l'origine de chaque avis.</p>

      <h2>Comment les produits sont évalués</h2>
      <p>Chaque robot est noté sur 10, critère par critère, selon une grille identique pour tous.
      Le détail figure sur notre page <a href="../methodologie/">méthodologie</a>.</p>

      <h2>Test ou analyse&nbsp;: la différence</h2>
      <p>Un badge <strong>« Testé par TestBench »</strong> signifie que le robot a été utilisé chez nous
      au quotidien pendant plusieurs semaines. Un badge <strong>« Analyse »</strong> signifie que nous ne
      l'avons pas eu entre les mains et que la fiche s'appuie sur les essais indépendants publiés et les
      données constructeur.</p>
      <p>Sur les ${tests.length} fiches actuellement en ligne, ${tests.filter((t) => t.tested).length}
      correspond à un test réalisé à domicile. Nous ne présenterons jamais l'un pour l'autre.</p>

      <h2 id="affiliation">Comment fonctionne l'affiliation</h2>
      <p>Certains liens marchands du site sont des liens affiliés. Si vous achetez un produit après avoir
      cliqué sur l'un d'eux, TestBench peut percevoir une commission de la part du marchand.
      <strong>Le prix que vous payez est identique</strong>, avec ou sans ce lien.</p>
      <p>En tant que Partenaire Amazon, TestBench réalise un bénéfice sur les achats remplissant
      les conditions requises.</p>
      <p>Ces liens portent l'attribut <code>rel="sponsored nofollow"</code>, comme le demandent Google et
      les programmes d'affiliation. Ils n'influencent ni les notes attribuées, ni le contenu des avis,
      ni l'ordre du classement : un robot mal noté le reste, qu'il rapporte une commission ou non.</p>
      <p>Aucun avis de ce site n'est sponsorisé, et aucune marque ne relit nos contenus avant publication.</p>

      <h2>Nous contacter</h2>
      <p>Une erreur à signaler, une précision à apporter, une demande&nbsp;? L'adresse de contact est
      à renseigner par l'éditeur du site — voir les <a href="../mentions-legales/">mentions légales</a>.</p>

      <h2>À lire ensuite</h2>
      <ul class="related">
        <li><a href="../methodologie/">Notre méthodologie d'évaluation</a></li>
        <li><a href="../meilleur-robot-aspirateur/">Le classement des meilleurs robots aspirateurs</a></li>
        <li><a href="../tests/">Tous nos avis</a></li>
      </ul>
    </article>
  </div>
</main>

${S.footer(1)}`;

  write(
    'a-propos/index.html',
    S.document_({
      head: S.head({
        title: 'À propos de TestBench | Avis de robots aspirateurs',
        description:
          "Ce qu'est TestBench, comment les robots aspirateurs sont évalués, et comment fonctionne l'affiliation sur le site.",
        path: '/a-propos/',
        depth: 1,
        jsonld: [bc.jsonld],
      }),
      body,
    })
  );
}

/* ------------------------------------------ pages légales et 404 --------- */
const legales = [
  {
    dir: 'mentions-legales',
    title: 'Mentions légales | TestBench',
    h1: 'Mentions légales',
    desc: "Mentions légales du site TestBench : éditeur, hébergeur et conditions d'utilisation.",
    body: `      <div class="callout callout--warn">
        <span class="callout__label">À compléter par l'éditeur</span>
        <p>Les champs d'identification ci-dessous sont obligatoires en France pour un site
        accessible au public. Ils doivent être renseignés par l'éditeur du site : nous ne
        pouvons pas les inventer.</p>
      </div>

      <h2>Éditeur du site</h2>
      <ul>
        <li>Nom ou raison sociale : <em>à compléter</em></li>
        <li>Statut (particulier, micro-entreprise, société) : <em>à compléter</em></li>
        <li>Adresse : <em>à compléter</em></li>
        <li>Adresse de contact : <em>à compléter</em></li>
        <li>Numéro SIREN/SIRET le cas échéant : <em>à compléter</em></li>
        <li>Directeur de la publication : <em>à compléter</em></li>
      </ul>

      <h2>Hébergement</h2>
      <p>Le site est hébergé par GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street,
      San Francisco, CA 94107, États-Unis.</p>

      <h2>Propriété intellectuelle</h2>
      <p>Les textes et les notes publiés sur TestBench sont la propriété de l'éditeur du site.
      Les marques et noms de produits cités appartiennent à leurs détenteurs respectifs.</p>

      <h2>Liens affiliés</h2>
      <p>Le site contient des liens affiliés rémunérés à la commission.
      <a href="../a-propos/#affiliation">Le fonctionnement est détaillé ici</a>.</p>`,
  },
  {
    dir: 'confidentialite',
    title: 'Politique de confidentialité | TestBench',
    h1: 'Politique de confidentialité',
    desc: 'Quelles données le site TestBench collecte, et ce que font les liens marchands sortants.',
    body: `      <h2>Données collectées par TestBench</h2>
      <p>Le site est un site statique. En l'état actuel, il ne dépose aucun cookie, n'utilise
      aucun outil de mesure d'audience, et ne collecte aucune donnée personnelle : il n'y a ni
      formulaire, ni compte utilisateur, ni newsletter.</p>

      <div class="callout callout--warn">
        <span class="callout__label">À mettre à jour</span>
        <p>Cette page devra être complétée dès l'ajout d'un outil de mesure d'audience
        (Google Analytics, Matomo…), d'un formulaire de contact ou d'une newsletter.</p>
      </div>

      <h2>Hébergement</h2>
      <p>Le site est hébergé par GitHub Pages. GitHub enregistre des journaux de connexion
      (dont l'adresse IP) pour assurer le service et sa sécurité, conformément à sa propre
      politique de confidentialité.</p>

      <h2>Polices de caractères</h2>
      <p>Les polices sont chargées depuis Google Fonts. Ce chargement transmet votre adresse IP
      aux serveurs de Google.</p>

      <h2>Liens marchands</h2>
      <p>Les liens vers les marchands sont des liens affiliés. En cliquant dessus, vous quittez
      TestBench : le marchand applique alors sa propre politique de confidentialité et peut
      déposer ses propres cookies, notamment pour attribuer la vente.
      <a href="../a-propos/#affiliation">Détail de notre fonctionnement en affiliation</a>.</p>

      <h2>Vos droits</h2>
      <p>TestBench ne détenant aucune donnée personnelle vous concernant, aucune demande d'accès,
      de rectification ou de suppression n'a d'objet à ce jour. Pour toute question, l'adresse de
      contact figure dans les <a href="../mentions-legales/">mentions légales</a>.</p>`,
  },
];

for (const p of legales) {
  const bc = S.breadcrumb([{ name: 'Accueil', path: '' }, { name: p.h1, path: p.dir + '/' }], 1);
  write(
    `${p.dir}/index.html`,
    S.document_({
      head: S.head({
        title: p.title,
        description: p.desc,
        path: `/${p.dir}/`,
        depth: 1,
        jsonld: [bc.jsonld],
      }),
      body: `${S.header(1)}

<main id="main">
${bc.html}
  <section class="hero hero--page">
    <div class="wrap"><h1>${p.h1}</h1></div>
  </section>
  <div class="wrap">
    <article class="prose">
${p.body}
    </article>
  </div>
</main>

${S.footer(1)}`,
    })
  );
}

/* GitHub Pages sert 404.html pour toute URL inconnue. */
write(
  '404.html',
  S.document_({
    head: S.head({
      title: 'Page introuvable | TestBench',
      description: "Cette page n'existe pas ou a été déplacée.",
      path: '/404.html',
      depth: 0,
      noindex: true,
    }),
    body: `${S.header(0)}

<main id="main">
  <section class="hero hero--page">
    <div class="wrap">
      <span class="tag">Erreur 404</span>
      <h1>Cette page n'existe pas</h1>
      <p class="hero__lead">Le lien est peut-être erroné, ou la page a été déplacée.
      Voici par où reprendre.</p>
      <ul class="related">
        <li><a href="./meilleur-robot-aspirateur/">Le classement des meilleurs robots aspirateurs</a></li>
        <li><a href="./tests/">Tous nos avis de robots aspirateurs</a></li>
        <li><a href="./methodologie/">Notre méthodologie</a></li>
        <li><a href="./">Retour à l'accueil</a></li>
      </ul>
    </div>
  </section>
</main>

${S.footer(0)}`,
  })
);
