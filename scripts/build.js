/* Régénère tout le site à partir de content/tests.json.
   Usage :  node scripts/build.js
   La sortie est du HTML statique : GitHub Pages n'exécute jamais ces scripts. */
require('./build-home');
require('./build-tests');
require('./build-pages');
require('./build-sitemap');
