# Book Library

Application web de gestion de bibliothèque personnelle, construite avec Angular 21 et Angular Material.

## Fonctionnalités

- **CRUD complet** sur les livres (titre, auteur, ISBN, année, genre, description)
- **Statut de lecture** : À lire / En cours / Lu — avec date de fin enregistrée
- **Notation** par étoiles (1 à 5)
- **Recherche** plein texte (titre, auteur, genre, description)
- **Filtrage** par genre et **tri** (date d'ajout, titre, auteur, année)
- **Pagination** de la liste
- **Formulaires dynamiques** via ngx-formly (validation, champs conditionnels, widget étoiles)
- **Internationalisation** (anglais / français) avec l'i18n natif d'Angular (`@angular/localize`)
- **Mode sombre** persistant
- **Persistance locale** via `localStorage` (aucun backend requis)

## Stack technique

| Couche       | Technologie                                   |
|--------------|-----------------------------------------------|
| Framework    | Angular 21 — standalone, signals, zoneless    |
| UI           | Angular Material 21 + CDK                     |
| Formulaires  | ngx-formly 7 (core + material)               |
| i18n         | `@angular/localize` (build par locale)        |
| Langage      | TypeScript 5.9                                |
| Réactivité   | Signals (`signal`, `computed`) + RxJS 7.8     |
| Styles       | SCSS + tokens M3 (CSS custom properties)      |
| Tests e2e    | Playwright                                    |
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
│           └── book-form/    # Formulaire création / édition (formly)
└── shared/
    └── components/
        ├── confirm-dialog/        # Dialogue de confirmation générique
        ├── star-rating/           # Composant étoiles réutilisable
        └── formly-star-rating/    # Wrapper formly du composant étoiles

src/locale/
├── messages.xlf       # Modèle d'extraction (source anglaise) — régénérable
└── messages.fr.xlf    # Traductions françaises (source EN → cible FR)
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
npm start          # Serveur de développement (anglais) → http://localhost:4200
npm run start:fr   # Serveur de développement en français
npm run start:en   # Serveur de développement en anglais
npm run build      # Build de production (génère dist/book-library/browser/{en,fr})
npm run watch      # Build en mode watch (développement)
```

## Internationalisation

L'application utilise l'i18n **compile-time** d'Angular : chaque langue est un build séparé,
servi sur son propre sous-chemin en production (`/en/`, `/fr/`).

- **Locale source** : `en` — les textes anglais sont écrits directement dans le code
  (`$localize` et attribut `i18n`), avec un identifiant stable (`@@mon.id`).
- **Locale cible** : `fr` — traduite via `src/locale/messages.fr.xlf`.

Pour ajouter ou modifier des textes :

```bash
npm run ng -- extract-i18n   # Régénère src/locale/messages.xlf (source anglaise)
```

Puis reporter les nouvelles `<trans-unit>` dans `messages.fr.xlf` en renseignant leur `<target>`.

## Tests end-to-end

Suite Playwright (`e2e/`) couvrant la liste, le détail, le formulaire et la toolbar.
Les sélecteurs sont **agnostiques à la langue** (`data-testid`, classes, URLs), les tests
s'exécutent contre le build anglais (`npm start`).

```bash
npm run e2e          # Exécute toute la suite (lance npm start automatiquement)
npm run e2e:ui       # Mode interactif (UI runner)
npm run e2e:debug    # Mode debug pas à pas
npm run e2e:report   # Ouvre le dernier rapport HTML
```

## Données initiales

Au premier lancement, 5 livres d'exemple sont chargés automatiquement depuis `BookService`.
Ils sont ensuite persistés dans `localStorage` (vider le stockage réinitialise les données).
