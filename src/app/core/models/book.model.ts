export const READING_STATUS_VALUES = ['TO_READ', 'READING', 'READ'] as const;

export type ReadingStatus = typeof READING_STATUS_VALUES[number];

/** Libellé localisé d'un statut de lecture (traduit à la compilation par $localize). */
export function readingStatusLabel(status: ReadingStatus): string {
  switch (status) {
    case 'TO_READ': return $localize`:@@status.to_read:To read`;
    case 'READING': return $localize`:@@status.reading:Reading`;
    case 'READ': return $localize`:@@status.read:Read`;
  }
}

export const BOOK_CATEGORIES = [
  'NOVEL',
  'FANTASY',
  'SCIENCE_FICTION',
  'THRILLER',
  'CRIME',
  'HORROR',
  'BIOGRAPHY',
  'HISTORY',
  'POETRY',
  'CHILDREN',
] as const;

export type BookCategory = typeof BOOK_CATEGORIES[number];

/** Libellé localisé d'une catégorie (traduit à la compilation par $localize). */
export function bookCategoryLabel(category: BookCategory): string {
  switch (category) {
    case 'NOVEL': return $localize`:@@category.novel:Novel`;
    case 'FANTASY': return $localize`:@@category.fantasy:Fantasy`;
    case 'SCIENCE_FICTION': return $localize`:@@category.science_fiction:Science fiction`;
    case 'THRILLER': return $localize`:@@category.thriller:Thriller`;
    case 'CRIME': return $localize`:@@category.crime:Crime`;
    case 'HORROR': return $localize`:@@category.horror:Horror`;
    case 'BIOGRAPHY': return $localize`:@@category.biography:Biography`;
    case 'HISTORY': return $localize`:@@category.history:History`;
    case 'POETRY': return $localize`:@@category.poetry:Poetry`;
    case 'CHILDREN': return $localize`:@@category.children:Children`;
  }
}

export interface Book {
  id: number;
  name: string;
  author: string;
  isbn: string;
  pages: number;
  year: number;
  description: string;
  category: BookCategory | null;
  status: ReadingStatus;
  rating: number | null;
}

/** Corps des requêtes POST / PUT (= PostInput de l'API, le livre sans son id). */
export type BookInput = Omit<Book, 'id'>;

export type SortOption = 'id-desc' | 'name-asc' | 'author-asc' | 'year-desc';

export const SORT_VALUES: SortOption[] = ['id-desc', 'name-asc', 'author-asc', 'year-desc'];

/** Libellé localisé d'une option de tri (traduit à la compilation par $localize). */
export function sortOptionLabel(option: SortOption): string {
  switch (option) {
    case 'id-desc': return $localize`:@@sort.id_desc:Recently added`;
    case 'name-asc': return $localize`:@@sort.name_asc:Title (A → Z)`;
    case 'author-asc': return $localize`:@@sort.author_asc:Author (A → Z)`;
    case 'year-desc': return $localize`:@@sort.year_desc:Year (newest → oldest)`;
  }
}
