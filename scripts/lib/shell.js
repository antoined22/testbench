/* Éléments communs à toutes les pages générées : head, en-tête, pied de page.
   Un seul endroit à modifier pour le maillage interne et les balises SEO. */

const SITE = 'https://antoined22.github.io/testbench';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Retire le HTML d'un texte destiné à une balise meta ou au JSON-LD. */
const plain = (s) => String(s).replace(/<[^>]+>/g, '');

const MOIS = {
  janvier: '01', février: '02', mars: '03', avril: '04', mai: '05', juin: '06',
  juillet: '07', août: '08', septembre: '09', octobre: '10', novembre: '11', décembre: '12',
};
function isoDate(fr) {
  const m = String(fr).match(/(\d{1,2})\s+(\S+)\s+(\d{4})/);
  if (!m || !MOIS[m[2].toLowerCase()]) return '';
  return `${m[3]}-${MOIS[m[2].toLowerCase()]}-${String(m[1]).padStart(2, '0')}`;
}

/* `depth` = nombre de niveaux au-dessus de la racine du site.
   0 pour /page.html, 1 pour /dossier/index.html, 2 pour /tests/slug/index.html. */
const up = (depth) => (depth === 0 ? './' : '../'.repeat(depth));

function head({ title, description, path, image, depth, type = 'website', jsonld = [], noindex = false }) {
  const url = SITE + path;
  const img = SITE + (image || '/assets/img/og-testbench.png');
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex, follow">\n' : ''}
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="TestBench">
<meta property="og:locale" content="fr_FR">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${img}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up(depth)}assets/css/style.css">
${jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}`;
}

function header(depth, current) {
  const r = up(depth);
  const cur = (k) => (k === current ? ' aria-current="page"' : '');
  return `<div class="aurora"></div>
<div class="grid-overlay"></div>

<a class="skip-link" href="#main">Aller au contenu</a>

<header class="site-header">
  <div class="wrap site-header__inner">
    <a class="brand" href="${r}">
      <span class="brand__mark" aria-hidden="true">T</span>
      <span class="brand__name">Test<span>Bench</span></span>
    </a>
    <nav class="nav" aria-label="Navigation principale">
      <a href="${r}tests/"${cur('tests')}>Tests</a>
      <a href="${r}meilleur-robot-aspirateur/"${cur('meilleur')}>Meilleurs robots</a>
      <a href="${r}methodologie/"${cur('methodologie')}>Méthodologie</a>
    </nav>
  </div>
</header>`;
}

function footer(depth) {
  const r = up(depth);
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-cols">
      <div>
        <a class="brand" href="${r}">
          <span class="brand__mark" aria-hidden="true">T</span>
          <span class="brand__name">Test<span>Bench</span></span>
        </a>
        <p>Avis et tests de robots aspirateurs. Nous distinguons toujours ce que
        nous avons utilisé nous-mêmes de ce que nous analysons à partir de sources publiques.</p>
      </div>
      <nav aria-label="Tests et classements">
        <h2>Tests</h2>
        <a href="${r}meilleur-robot-aspirateur/">Meilleurs robots aspirateurs</a>
        <a href="${r}tests/">Tous les tests</a>
        <a href="${r}tests/#dreame">Robots Dreame</a>
        <a href="${r}tests/#roborock">Robots Roborock</a>
      </nav>
      <nav aria-label="Le site">
        <h2>Le site</h2>
        <a href="${r}methodologie/">Méthodologie</a>
        <a href="${r}a-propos/">À propos</a>
        <a href="${r}a-propos/#affiliation">Affiliation</a>
      </nav>
      <nav aria-label="Informations légales">
        <h2>Légal</h2>
        <a href="${r}mentions-legales/">Mentions légales</a>
        <a href="${r}confidentialite/">Confidentialité</a>
      </nav>
    </div>
    <p class="legal">
      Certains liens de ce site sont des liens affiliés : si vous achetez via ces liens, TestBench peut
      percevoir une commission, sans surcoût pour vous. Cela n'influence ni les notes ni le contenu des avis.
      © 2026 TestBench.
    </p>
  </div>
</footer>`;
}

/* Fil d'ariane visible + son équivalent BreadcrumbList pour Google. */
function breadcrumb(items, depth) {
  const r = up(depth);
  const html = items
    .map((it, i) =>
      i === items.length - 1
        ? `<span aria-current="page">${it.name}</span>`
        : `<a href="${r}${it.path}">${it.name}</a><span>/</span>`
    )
    .join('');
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: SITE + '/' + it.path,
    })),
  };
  return {
    html: `  <div class="wrap">
    <nav class="breadcrumb" aria-label="Fil d'ariane">${html}</nav>
  </div>`,
    jsonld,
  };
}

function document_({ head: h, body }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
${h}
</head>
<body>
${body}
</body>
</html>
`;
}

module.exports = { SITE, esc, plain, isoDate, up, head, header, footer, breadcrumb, document_ };
