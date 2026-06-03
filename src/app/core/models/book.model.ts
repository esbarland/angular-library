export type ReadingStatus = 'to-read' | 'reading' | 'read';

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  'to-read': 'À lire',
  reading: 'En cours',
  read: 'Lu',
};

export const READING_STATUSES: { value: ReadingStatus; label: string }[] = [
  { value: 'to-read', label: 'À lire' },
  { value: 'reading', label: 'En cours' },
  { value: 'read', label: 'Lu' },
];

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

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'createdAt-desc', label: "Date d'ajout" },
  { value: 'title-asc', label: 'Titre (A → Z)' },
  { value: 'author-asc', label: 'Auteur (A → Z)' },
  { value: 'publishedYear-desc', label: 'Année (récent → ancien)' },
];
