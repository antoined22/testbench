# TestBench

Site statique de tests produits (HTML/CSS pur, aucun build, aucune dépendance).
Style dark premium tech / glassmorphism. Hébergé sur GitHub Pages.

## Structure

```
index.html                 Accueil : hero, filtres catégories, grille des tests, méthode
produits/                  Une page par produit testé
  _modele.html             Gabarit à copier pour chaque nouveau test
assets/css/style.css       Toute la mise en forme du site
assets/img/                Photos produits
.github/workflows/pages.yml  Déploiement automatique sur GitHub Pages
```

## Ajouter un test produit

1. Copier `produits/_modele.html` en `produits/marque-modele.html`.
2. Remplacer les `{{...}}` : titre, chapô, sections, fiche technique, note et sous-notes.
   Pour l'anneau de note, `--value` vaut la note × 10 (7,4/10 → `--value:74`).
3. Dupliquer le bloc `<!-- ▼ CARTE PRODUIT ▼ -->` dans `index.html` et le remplir.
4. Ajouter la photo dans `assets/img/` et remplacer le `<span class="card__placeholder">`
   par la balise `<img>`.

## Ajouter une catégorie

Ajouter un `<span class="chip">` dans la liste des catégories de `index.html`
(retirer `chip--soon` quand la catégorie contient au moins un test).

## Liens d'affiliation

Trois emplacements sont prévus sur chaque page produit, repérés par des commentaires
`EMPLACEMENT AFFILIATION` :

- le CTA en cours d'article, qui renvoie vers le bloc marchands ;
- le bloc « Où l'acheter » en colonne latérale (Amazon + autres marchands) ;
- la mention légale de bas de page.

Remplacer les `href` par les liens trackés. Les liens marchands portent déjà
`rel="sponsored nofollow noopener"`, requis par Google et par les programmes d'affiliation.

## Déploiement

Le workflow `pages.yml` publie le contenu du dépôt à chaque push sur `main`.
Activation, une seule fois : **Settings → Pages → Source : GitHub Actions**.

Prévisualisation locale :

```bash
python3 -m http.server 8000
```
