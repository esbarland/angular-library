# Book Library

Application web de gestion de bibliothèque personnelle, construite avec Angular 21 et Angular Material.

## Fonctionnalités

- **CRUD complet** sur les livres (titre, auteur, ISBN, année, genre, description)
- **Statut de lecture** : À lire / En cours / Lu — avec date de fin enregistrée
- **Notation** par étoiles (1 à 5)
- **Recherche** plein texte (titre, auteur, genre, description)
- **Filtrage** par genre et **tri** (date d'ajout, titre, auteur, année)
- **Pagination** de la liste
- **Mode sombre** persistant
- **Persistance locale** via `localStorage` (aucun backend requis)

## Stack technique

| Couche       | Technologie                                   |
|--------------|-----------------------------------------------|
| Framework    | Angular 21 — standalone, signals, zoneless    |
| UI           | Angular Material 21 + CDK                     |
| Langage      | TypeScript 5.9                                |
| Réactivité   | Signals (`signal`, `computed`) + RxJS 7.8     |
| Styles       | SCSS + tokens M3 (CSS custom properties)      |
| Persistence  | `localStorage`                                |

## Architecture

```
src/app/
├── core/
│   ├── models/        # Interfaces et constantes (Book, genres, statuts…)
│   └── services/      # BookService — état global via signals
├── features/
│   └── books/
│       ├── books.routes.ts
│       └── components/
│           ├── book-list/    # Liste filtrée, triée, paginée
│           ├── book-detail/  # Fiche détail + notation
│           └── book-form/    # Formulaire création / édition
└── shared/
    └── components/
        ├── confirm-dialog/   # Dialogue de confirmation générique
        └── star-rating/      # Composant étoiles réutilisable
```

## Routes

| URL              | Vue                    |
|------------------|------------------------|
| `/`              | Redirige vers `/books` |
| `/books`         | Liste des livres        |
| `/books/new`     | Créer un livre          |
| `/books/:id`     | Détail d'un livre       |
| `/books/:id/edit`| Modifier un livre       |

## Démarrage

```bash
npm install
npm start        # Serveur de développement → http://localhost:4200
npm run build    # Build de production → dist/book-library
npm run watch    # Build en mode watch (développement)
```

## Données initiales

Au premier lancement, 5 livres d'exemple (en français) sont chargés automatiquement depuis `BookService`. Ils sont ensuite persistés dans `localStorage`.
