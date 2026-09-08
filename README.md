# TestBench

Site statique de tests produits (HTML/CSS, aucun build, aucune dépendance).
Style dark premium tech / glassmorphism. Hébergé sur GitHub Pages.

**En ligne : https://antoined22.github.io/testbench/**

## Structure

```
index.html                     Accueil : hero, filtres catégories, grille des tests, méthode
tests/<slug>/index.html        Une page par produit → URL propre /tests/<slug>/
_templates/produit.html        Gabarit à copier pour chaque nouveau test (non indexé)
produits/                      Anciennes URLs, redirections seulement
assets/css/style.css           Toute la mise en forme
assets/js/nav.js               Lien de navigation actif suivant la section à l'écran
assets/img/                    Photos produits et images Open Graph (1200×630)
sitemap.xml                    Liste des URLs pour Google
robots.txt                     Indexation ouverte + référence au sitemap
.github/workflows/pages.yml    Déploiement auto sur push vers main
```

## Ajouter un test produit

1. Copier `_templates/produit.html` vers `tests/marque-modele/index.html`.
   Le **dossier** fait l'URL : `/tests/marque-modele/`. Ne pas créer de fichier `.html` à plat.
2. Remplacer les `{{...}}` : titre, chapô, sections, fiche technique, note et sous-notes.
   Pour l'anneau de note, `--value` vaut la note × 10 (7,4/10 → `--value:74`).
3. Dupliquer le bloc `<!-- ▼ CARTE PRODUIT ▼ -->` dans `index.html` et le remplir.
4. **Ajouter l'URL dans `sitemap.xml`** et mettre à jour son `<lastmod>`.
5. Ajouter la photo dans `assets/img/`, remplacer le `<span class="card__placeholder">` par une `<img>`.

## SEO

- **Titre** ≤ 60 caractères, **description** 150-160, uniques sur chaque page.
  Viser la requête « avis test [produit] » : mettre le nom exact du produit en tête de titre.
- **Canonical, `og:url`** : URL absolue en `https://antoined22.github.io/testbench/...`.
- **Open Graph** : chaque page a `og:title`, `og:description`, `og:image` (1200×630)
  et les équivalents Twitter. Générer l'image avec `scripts/og.js` (voir plus bas).
- Après publication, soumettre le sitemap dans la Google Search Console.

### Régénérer les images Open Graph

```bash
node scripts/og.js      # écrit assets/img/og-*.png (nécessite playwright)
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
