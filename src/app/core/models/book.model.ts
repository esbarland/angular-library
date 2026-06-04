export type ReadingStatus = 'to-read' | 'reading' | 'read';

export const READING_STATUS_VALUES: ReadingStatus[] = ['to-read', 'reading', 'read'];

/** Libellé localisé d'un statut de lecture (traduit à la compilation par $localize). */
export function readingStatusLabel(status: ReadingStatus): string {
  switch (status) {
    case 'to-read': return $localize`:@@status.to_read:To read`;
    case 'reading': return $localize`:@@status.reading:Reading`;
    case 'read': return $localize`:@@status.read:Read`;
  }
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  genre: string;
  description: string;
  readingStatus: ReadingStatus;
  finishedAt: Date | null;
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type BookFormData = Omit<Book, 'id' | 'createdAt' | 'updatedAt'>;

export const BOOK_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science-Fiction',
  'Fantasy',
  'Policier / Thriller',
  'Romance',
  'Horreur',
  'Biographie',
  'Histoire',
  'Sciences',
  'Technologie',
  'Philosophie',
  'Poésie',
  'Développement personnel',
  'Autre',
] as const;

export type BookGenre = typeof BOOK_GENRES[number];

export type SortOption = 'createdAt-desc' | 'title-asc' | 'author-asc' | 'publishedYear-desc';

export const SORT_VALUES: SortOption[] = ['createdAt-desc', 'title-asc', 'author-asc', 'publishedYear-desc'];

/** Libellé localisé d'une option de tri (traduit à la compilation par $localize). */
export function sortOptionLabel(option: SortOption): string {
  switch (option) {
    case 'createdAt-desc': return $localize`:@@sort.createdAt_desc:Date added`;
    case 'title-asc': return $localize`:@@sort.title_asc:Title (A → Z)`;
    case 'author-asc': return $localize`:@@sort.author_asc:Author (A → Z)`;
    case 'publishedYear-desc': return $localize`:@@sort.publishedYear_desc:Year (newest → oldest)`;
  }
}
