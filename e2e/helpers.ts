import { Page } from '@playwright/test';

/**
 * Livre au format de l'API (PostOutput). `category`/`status` sont les énumérations
 * de la spec OpenAPI. Le tri par défaut de la liste est `id-desc` : l'id le plus
 * élevé apparaît en premier.
 */
export interface MockBook {
  id: number;
  name: string;
  author: string;
  isbn: string;
  pages: number;
  year: number;
  description: string;
  category: string | null;
  status: 'TO_READ' | 'READING' | 'READ';
  rating: number | null;
}

/** Jeu de données de démonstration (5 livres) servi par l'API mockée. */
export function defaultSeed(): MockBook[] {
  return [
    { id: 1, name: 'Le Seigneur des Anneaux', author: 'J.R.R. Tolkien', isbn: '978-2-07-061886-5', pages: 1216, year: 1954, description: 'Une épopée fantasy épique.', category: 'FANTASY', status: 'READ', rating: 5 },
    { id: 2, name: 'Dune', author: 'Frank Herbert', isbn: '978-2-07-036024-3', pages: 688, year: 1965, description: 'Un roman de science-fiction.', category: 'SCIENCE_FICTION', status: 'READING', rating: null },
    { id: 3, name: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-2-226-25701-7', pages: 443, year: 2011, description: 'Une brève histoire de l\'humanité.', category: 'HISTORY', status: 'READ', rating: 4 },
    { id: 4, name: '1984', author: 'George Orwell', isbn: '978-2-07-036822-5', pages: 328, year: 1949, description: 'Un roman dystopique.', category: 'NOVEL', status: 'TO_READ', rating: null },
    { id: 5, name: 'Le Petit Prince', author: 'Antoine de Saint-Exupéry', isbn: '978-2-07-040850-4', pages: 96, year: 1943, description: 'Un conte poétique et philosophique.', category: 'NOVEL', status: 'READ', rating: 5 },
  ];
}

/**
 * Installe un faux backend (intercepte tous les appels vers l'API `localhost:8080`).
 * État maintenu en mémoire pour la durée de la page : create/update/rate/delete sont
 * persistés entre les navigations d'un même test.
 */
export async function mockApi(page: Page, seed: MockBook[] = defaultSeed()): Promise<void> {
  const books: MockBook[] = seed.map(b => ({ ...b }));
  let nextId = books.reduce((max, b) => Math.max(max, b.id), 0) + 1;

  // Intercepte les appels API par leur chemin (/book, /book/{id}, /book/{id}/rating),
  // que l'URL de base soit absolue (:8080) ou relative via le proxy (:4200).
  // Ne matche pas la route SPA /books (le 's' suit immédiatement « book »).
  await page.route(/\/book(\/|\?|$)/, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const segments = url.pathname.split('/').filter(Boolean); // ['book'] | ['book','5'] | ['book','5','rating']
    const method = request.method();

    const json = (status: number, body: unknown) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    // /book
    if (segments.length === 1 && segments[0] === 'book') {
      if (method === 'GET') {
        const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
        const result = search
          ? books.filter(b =>
              b.name.toLowerCase().includes(search) ||
              b.author.toLowerCase().includes(search) ||
              b.description.toLowerCase().includes(search))
          : books;
        return json(200, result);
      }
      if (method === 'POST') {
        const body = request.postDataJSON() as Omit<MockBook, 'id'>;
        const created: MockBook = { ...body, id: nextId++ };
        books.push(created);
        return json(201, created);
      }
    }

    // /book/{id} and /book/{id}/rating
    if (segments.length >= 2 && segments[0] === 'book') {
      const id = Number(segments[1]);
      const index = books.findIndex(b => b.id === id);
      if (index === -1) return route.fulfill({ status: 404, body: '' });

      const isRating = segments.length === 3 && segments[2] === 'rating';

      if (method === 'GET' && !isRating) {
        return json(200, books[index]);
      }
      if (method === 'PUT' && isRating) {
        const body = request.postDataJSON() as { rating: number };
        books[index] = { ...books[index], rating: body.rating };
        return json(200, books[index]);
      }
      if (method === 'PUT' && !isRating) {
        const body = request.postDataJSON() as Omit<MockBook, 'id'>;
        books[index] = { ...body, id };
        return json(200, books[index]);
      }
      if (method === 'DELETE' && !isRating) {
        books.splice(index, 1);
        return route.fulfill({ status: 204, body: '' });
      }
    }

    return route.fulfill({ status: 404, body: '' });
  });
}

export async function waitForList(page: Page) {
  await page.goto('/books');
  await page.locator('.book-row').first().waitFor();
}
