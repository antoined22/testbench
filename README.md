# TestBench

Site statique d'avis de robots aspirateurs (HTML/CSS, aucune dépendance au runtime).
Style dark premium tech / glassmorphism. Hébergé sur GitHub Pages.

**En ligne : https://antoined22.github.io/testbench/**

## Principe

Tout le site est généré depuis une source unique, `content/tests.json`.
La sortie est du **HTML statique ordinaire** : GitHub Pages n'exécute jamais ces
scripts, il sert les fichiers tels qu'ils sont commités.

```bash
node scripts/build.js     # régénère tout le site
```

## Structure

```
content/tests.json             Source unique : un objet par robot
scripts/build.js               Régénère tout (appelle les 4 scripts ci-dessous)
scripts/lib/shell.js           head, en-tête, pied de page, fil d'ariane communs
scripts/build-home.js          index.html
scripts/build-tests.js         tests/<slug>/index.html
scripts/build-pages.js         tests/, meilleur-robot-aspirateur/, methodologie/,
                               a-propos/, mentions-legales/, confidentialite/, 404.html
scripts/build-sitemap.js       sitemap.xml
scripts/og.js                  assets/img/og-*.png (images de partage 1200x630)
assets/css/style.css           Toute la mise en forme
produits/                      Anciennes URL, redirections noindex uniquement
robots.txt                     Indexation ouverte + référence au sitemap
.github/workflows/pages.yml    Déploiement auto sur push vers main
```

## Ajouter un robot

1. Ajouter une entrée dans `content/tests.json`.
   Champs : `slug`, `name`, `brand`, `category`, `date`, `note`, `lead`,
   `description` (150-160 caractères), `verdict`, `criteria`, `sections`,
   `pros`, `cons`, `specs`.
   Optionnels : `tested`, `testDuration`, `testConditions`, `role`,
   `audienceFor`, `audienceNot`, `warning`, `closing`, `noteProvisoire`,
   `notCovered`, `image`.
2. `node scripts/build.js`
3. `node scripts/og.js` pour l'image de partage (voir plus bas).

Les cartes d'accueil, la page /tests/, le classement, le sitemap et le maillage
interne se mettent à jour tout seuls.

### Le champ `tested` — à ne jamais falsifier

`"tested": true` affiche le badge **« Testé par TestBench »** et les lignes
« Durée du test » et « Conditions ». Ne le passer à `true` que si le robot a
réellement été utilisé à domicile.

`false` affiche **« Analyse — non testé par nos soins »** et un encadré
indiquant que la fiche s'appuie sur les essais indépendants publiés.

Cette distinction est le socle de crédibilité du site et elle est expliquée
publiquement sur `/methodologie/`.

## Images

Le champ `image` d'un test (`{"file": "...", "alt": "..."}`) affiche une photo
à la place du fond dégradé, avec `width`, `height`, `loading="lazy"` et texte
alternatif. Déposer le fichier dans `assets/img/`.

Images de partage :

```bash
npm i playwright && npx playwright install chromium   # une seule fois
node scripts/og.js
```

## SEO

- Titre <= 65 caractères, description 150-160, uniques sur chaque page.
- Canonical et `og:url` absolus en `https://antoined22.github.io/testbench/...`.
- Données structurées : `Product` + `Review` sur les fiches, `BreadcrumbList`
  partout, `FAQPage` sur la page pilier, `WebSite`/`Organization`/`ItemList`
  sur l'accueil. **Ne jamais y déclarer un prix, une note ou un avis absent
  de la page visible** : Google sanctionne l'écart.
- Pas d'`aggregateRating` : une seule évaluation éditoriale, pas un agrégat.
- Pas d'`offers` tant qu'aucun prix n'est relevé.

## Liens d'affiliation

Bloc « Où l'acheter » sur chaque fiche, repéré par `EMPLACEMENT AFFILIATION`
dans `scripts/build-tests.js`. Les liens portent déjà
`rel="sponsored nofollow noopener"`. Fonctionnement expliqué sur `/a-propos/#affiliation`.

## Déploiement

`pages.yml` publie le dépôt à chaque push sur `main`.
Prévisualisation locale : `python3 -m http.server 8000`.
