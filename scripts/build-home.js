/* Génère la page d'accueil à partir de content/tests.json.
   Usage :  node scripts/build-home.js */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const S = require('./lib/shell');
const tests = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'tests.json'), 'utf8')).tests;
const num = s => parseFloat(String(s).replace(',', '.'));
const byNote = [...tests].sort((a,b) => num(b.note) - num(a.note));
const tested = tests.filter(t => t.tested);

const card = t => `
        <article class="glass card">
          <div class="card__media">
            <span class="card__placeholder">Photo à venir</span>
            <div class="card__score">${t.note}<span>/10</span></div>
          </div>
          <div class="card__body">
            <span class="card__cat">${t.brand}</span>
            <h3 class="card__title">
              <a href="./tests/${t.slug}/">${t.name}</a>
            </h3>
            <p class="card__excerpt">${t.lead}</p>
            <div class="card__foot">
              <span>${t.tested ? 'Testé par TestBench' : 'Analyse'}</span>
              <a class="card__link" href="./tests/${t.slug}/">${t.tested ? 'Lire le test' : "Lire l'avis"}</a>
            </div>
          </div>
        </article>`;

const jsonld = [
  { '@context':'https://schema.org', '@type':'WebSite', name:'TestBench', url: S.SITE + '/',
    inLanguage:'fr-FR',
    description:"Avis et tests de robots aspirateurs, avec distinction explicite entre produits testés à domicile et analyses documentaires." },
  { '@context':'https://schema.org', '@type':'Organization', name:'TestBench', url: S.SITE + '/',
    logo: S.SITE + '/assets/img/og-testbench.png' },
  { '@context':'https://schema.org', '@type':'ItemList', name:'Robots aspirateurs évalués par TestBench',
    numberOfItems: byNote.length,
    itemListElement: byNote.map((t,i) => ({ '@type':'ListItem', position:i+1, name:t.name,
      url: `${S.SITE}/tests/${t.slug}/` })) },
];

const body = `${S.header(0)}

<main id="main">

  <!-- ================= HERO ================= -->
  <section class="hero" id="accueil">
    <div class="wrap">
      <span class="tag tag--accent"><span class="dot"></span> Avis de robots aspirateurs</span>
      <h1>Le banc d'essai des robots aspirateurs qu'on utilise <em>vraiment</em>.</h1>
      <p class="hero__lead">
        TestBench publie des avis détaillés sur les robots aspirateurs, notés critère par critère.
        Chaque fiche dit d'où vient l'information&nbsp;: un robot <strong>testé chez nous</strong> pendant
        plusieurs semaines, ou une <strong>analyse</strong> des essais indépendants publiés. Les défauts
        sont écrits noir sur blanc.
      </p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="./meilleur-robot-aspirateur/">Voir le classement</a>
        <a class="btn" href="./tests/">Tous les avis</a>
        <a class="btn" href="./methodologie/">Notre méthodologie</a>
      </div>

      <div class="stats">
        <div class="glass stat">
          <div class="stat__num">${tests.length}</div>
          <div class="stat__label">robots évalués</div>
        </div>
        <div class="glass stat">
          <div class="stat__num">${tested.length}</div>
          <div class="stat__label">testé${tested.length>1?'s':''} à domicile</div>
        </div>
        <div class="glass stat">
          <div class="stat__num">2</div>
          <div class="stat__label">marques couvertes</div>
        </div>
        <div class="glass stat">
          <div class="stat__num">0</div>
          <div class="stat__label">avis sponsorisé</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= TESTÉ CHEZ NOUS ================= -->
  <section class="section section--tight" id="testes">
    <div class="wrap">
      <div class="section-head">
        <div>
          <span class="tag tag--tested"><span class="dot"></span> Testé par TestBench</span>
          <h2>Les robots que nous avons utilisés</h2>
          <p>Installés à la maison et utilisés au quotidien pendant plusieurs semaines, avec les
          défauts qui n'apparaissent qu'à l'usage.</p>
        </div>
      </div>
      <div class="cards">
${tested.map(card).join('\n')}
      </div>
    </div>
  </section>

  <!-- ================= ANALYSES ================= -->
  <section class="section section--tight" id="tests">
    <div class="wrap">
      <div class="section-head">
        <div>
          <span class="tag">Analyses</span>
          <h2>Les robots que nous avons analysés</h2>
          <p>Nous n'avons pas eu ces modèles entre les mains. Ces avis synthétisent les essais
          indépendants publiés et les données constructeur —
          <a href="./methodologie/">voir notre méthodologie</a>.</p>
        </div>
      </div>
      <div class="cards">
${byNote.filter(t => !t.tested).map(card).join('\n')}
      </div>
    </div>
  </section>

  <!-- ================= EXPLORER ================= -->
  <section class="section section--tight" id="explorer">
    <div class="wrap">
      <div class="section-head">
        <div>
          <span class="tag">Explorer</span>
          <h2>Par où commencer</h2>
        </div>
      </div>
      <div class="method">
        <a class="glass method__item" href="./meilleur-robot-aspirateur/">
          <div class="method__num">CLASSEMENT</div>
          <h3>Meilleur robot aspirateur 2026</h3>
          <p>Le classement des modèles que nous avons évalués, avec le meilleur choix par usage.</p>
        </a>
        <a class="glass method__item" href="./tests/#dreame">
          <div class="method__num">MARQUE</div>
          <h3>Robots Dreame</h3>
          <p>Nos avis sur les robots aspirateurs Dreame.</p>
        </a>
        <a class="glass method__item" href="./tests/#roborock">
          <div class="method__num">MARQUE</div>
          <h3>Robots Roborock</h3>
          <p>Nos avis sur la gamme Roborock Saros.</p>
        </a>
        <a class="glass method__item" href="./methodologie/">
          <div class="method__num">MÉTHODE</div>
          <h3>Comment nous évaluons</h3>
          <p>Nos critères de notation et la différence entre un test et une analyse.</p>
        </a>
      </div>
    </div>
  </section>

  <!-- ================= MÉTHODE ================= -->
  <section class="section section--tight" id="methode">
    <div class="wrap">
      <div class="section-head">
        <div>
          <span class="tag">Méthode</span>
          <h2>Comment on évalue</h2>
          <p>Un protocole simple, mais tenu : c'est dans la durée que les vrais défauts sortent.</p>
        </div>
      </div>

      <div class="method">
        <div class="glass method__item">
          <div class="method__num">01</div>
          <h3>Usage réel, pas labo</h3>
          <p>Quand nous testons un robot, il sert au quotidien dans un vrai logement occupé, avec ses
          contraintes et ses animaux.</p>
        </div>
        <div class="glass method__item">
          <div class="method__num">02</div>
          <h3>Test ou analyse, jamais confondus</h3>
          <p>Un badge indique sur chaque fiche si le robot a été utilisé chez nous ou seulement analysé.</p>
        </div>
        <div class="glass method__item">
          <div class="method__num">03</div>
          <h3>L'entretien compte</h3>
          <p>Un robot qui demande une corvée hebdomadaire est jugé sur cette corvée, pas seulement sur
          ses performances.</p>
        </div>
        <div class="glass method__item">
          <div class="method__num">04</div>
          <h3>Notes et défauts assumés</h3>
          <p>Une note sur 10, des points forts, des points faibles. Aucun avis n'est sponsorisé.</p>
        </div>
      </div>
    </div>
  </section>

</main>

${S.footer(0)}

<script src="./assets/js/nav.js" defer></script>`;

fs.writeFileSync(path.join(ROOT, 'index.html'), S.document_({
  head: S.head({
    title: 'Robot aspirateur : nos tests et avis | TestBench',
    description: "Avis et tests de robots aspirateurs Dreame et Roborock, notés critère par critère, avec la source de chaque évaluation clairement indiquée.",
    path: '/', depth: 0, jsonld,
  }),
  body,
}));
console.log('index.html régénéré');
