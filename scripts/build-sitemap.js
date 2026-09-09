/* Régénère sitemap.xml à partir de content/tests.json + des pages fixes.
   Usage :  node scripts/build-sitemap.js */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://antoined22.github.io/testbench';
const today = new Date().toISOString().slice(0, 10);
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'tests.json'), 'utf8'));

// Pages non générées depuis le JSON (rédigées à la main).
const fixed = [
  { loc: SITE + '/', changefreq: 'weekly', priority: '1.0' },
  { loc: SITE + '/tests/dreame-aqua10-ultra-roller-complete/', changefreq: 'monthly', priority: '0.8' },
];

const urls = fixed.concat(
  data.tests.map((t) => ({
    loc: `${SITE}/tests/${t.slug}/`,
    changefreq: 'monthly',
    priority: '0.8',
  }))
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Fichier généré par scripts/build-sitemap.js — ne pas éditer à la main. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log('sitemap.xml : ' + urls.length + ' URLs');
