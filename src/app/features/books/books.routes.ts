import { Routes } from '@angular/router';

export const BOOKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/book-list/book-list.component').then(m => m.BookListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/book-form/book-form.component').then(m => m.BookFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/book-detail/book-detail.component').then(m => m.BookDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/book-form/book-form.component').then(m => m.BookFormComponent),
  },
];
