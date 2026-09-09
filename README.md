# TestBench

Site statique de tests produits (HTML/CSS, aucun build, aucune dépendance).
Style dark premium tech / glassmorphism. Hébergé sur GitHub Pages.

**En ligne : https://antoined22.github.io/testbench/**

## Structure

```
index.html                     Accueil : hero, filtres catégories, grille des tests, méthode
content/tests.json             Source des tests : un objet par produit
scripts/build-tests.js         Génère tests/<slug>/index.html depuis ce JSON
scripts/build-sitemap.js       Régénère sitemap.xml
scripts/og.js                  Génère les images de partage 1200×630
tests/<slug>/index.html        Une page par produit → URL propre /tests/<slug>/
_templates/produit.html        Gabarit pour une page écrite à la main (non indexé)
produits/                      Anciennes URLs, redirections seulement
assets/css/style.css           Toute la mise en forme
assets/js/nav.js               Lien de navigation actif suivant la section à l'écran
assets/img/                    Photos produits et images Open Graph (1200×630)
sitemap.xml                    Généré — liste des URLs pour Google
robots.txt                     Indexation ouverte + référence au sitemap
.github/workflows/pages.yml    Déploiement auto sur push vers main
```

## Ajouter un test produit

Deux façons de faire coexistent. **Préférer la voie A**, plus rapide et plus régulière.

### A. Depuis `content/tests.json` (recommandé)

1. Ajouter une entrée dans `content/tests.json` : `slug`, `name`, `note`, `lead`,
   `description` (150-160 car., pour Google), `verdict`, `criteria`, `pros`, `cons`, `specs`.
   Champs optionnels : `role`, `audience`, `warning`, `closing`, `noteProvisoire`.
2. Régénérer :

```bash
node scripts/build-tests.js     # écrit tests/<slug>/index.html
node scripts/build-sitemap.js   # met sitemap.xml à jour
node scripts/og.js              # écrit assets/img/og-<slug>.png
```

3. Dupliquer le bloc `<!-- ▼ CARTE PRODUIT ▼ -->` dans `index.html` et le remplir.
4. Ajouter la photo dans `assets/img/`, remplacer le `<span class="card__placeholder">` par une `<img>`.

Les pages générées sont du HTML statique ordinaire : le site se déploie sans jamais
lancer ces scripts. Ne pas éditer `tests/<slug>/index.html` à la main pour une page
générée, la prochaine exécution écraserait la modification.

### B. À la main, depuis le gabarit

Pour une page hors norme. Copier `_templates/produit.html` vers `tests/marque-modele/index.html`
— le **dossier** fait l'URL — remplacer les `{{...}}`, puis ajouter l'URL à la liste `fixed`
de `scripts/build-sitemap.js`. Pour l'anneau de note, `--value` vaut la note × 10
(7,4/10 → `--value:74`). C'est la voie utilisée par la page Dreame Aqua10.

## SEO

- **Titre** ≤ 60 caractères, **description** 150-160, uniques sur chaque page.
  Viser la requête « avis test [produit] » : mettre le nom exact du produit en tête de titre.
- **Canonical, `og:url`** : URL absolue en `https://antoined22.github.io/testbench/...`.
- **Open Graph** : chaque page a `og:title`, `og:description`, `og:image` (1200×630)
  et les équivalents Twitter. Générer l'image avec `scripts/og.js` (voir plus bas).
- Après publication, soumettre le sitemap dans la Google Search Console.

### Régénérer les images Open Graph

```bash
npm i playwright && npx playwright install chromium   # une seule fois
node scripts/og.js                                    # écrit assets/img/og-*.png
```

## Liens d'affiliation

Trois emplacements par page produit, repérés par des commentaires `EMPLACEMENT AFFILIATION` :
le CTA en cours d'article, le bloc « Où l'acheter » en colonne latérale, la mention légale.
Remplacer les `href` par les liens trackés ; les liens marchands portent déjà
`rel="sponsored nofollow noopener"`, requis par Google et par les programmes d'affiliation.

## Déploiement

Le workflow `pages.yml` publie le dépôt à chaque push sur `main`.
Pages est déjà activé (Settings → Pages → Source : GitHub Actions).

Prévisualisation locale :

```bash
python3 -m http.server 8000
```
