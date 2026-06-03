import { Injectable, computed, signal } from '@angular/core';
import { Book, BookFormData, ReadingStatus } from '../models/book.model';

const STORAGE_KEY = 'book-library';

const SAMPLE_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Le Seigneur des Anneaux',
    author: 'J.R.R. Tolkien',
    isbn: '978-2-07-061886-5',
    publishedYear: 1954,
    genre: 'Fantasy',
    description: 'Une épopée fantasy épique se déroulant dans le monde imaginaire de la Terre du Milieu.',
    readingStatus: 'read',
    finishedAt: new Date('2024-03-15'),
    rating: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-2-07-036024-3',
    publishedYear: 1965,
    genre: 'Science-Fiction',
    description: 'Un roman de science-fiction se déroulant dans un futur lointain au sein d\'un empire galactique féodal.',
    readingStatus: 'reading',
    finishedAt: null,
    rating: null,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0-13-235088-4',
    publishedYear: 2008,
    genre: 'Technologie',
    description: 'Un guide pratique pour écrire un code propre, lisible et maintenable.',
    readingStatus: 'read',
    finishedAt: new Date('2024-02-10'),
    rating: 4,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: '4',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-2-07-036822-5',
    publishedYear: 1949,
    genre: 'Fiction',
    description: 'Un roman dystopique décrivant une société totalitaire où la surveillance est omniprésente.',
    readingStatus: 'to-read',
    finishedAt: null,
    rating: null,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: '5',
    title: 'Le Petit Prince',
    author: 'Antoine de Saint-Exupéry',
    isbn: '978-2-07-040850-4',
    publishedYear: 1943,
    genre: 'Fiction',
    description: 'Un conte poétique et philosophique sous l\'apparence d\'un conte pour enfants.',
    readingStatus: 'read',
    finishedAt: new Date('2024-01-20'),
    rating: 5,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
];

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly _books = signal<Book[]>(this.loadFromStorage());

  readonly books = this._books.asReadonly();
  readonly count = computed(() => this._books().length);

  getById(id: string): Book | undefined {
    return this._books().find(book => book.id === id);
  }

  create(data: BookFormData): Book {
    const book: Book = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this._books.update(books => [...books, book]);
    this.persist();
    return book;
  }

  update(id: string, data: BookFormData): Book {
    let updated!: Book;
    this._books.update(books =>
      books.map(book => {
        if (book.id === id) {
          updated = { ...book, ...data, updatedAt: new Date() };
          return updated;
        }
        return book;
      })
    );
    this.persist();
    return updated;
  }

  delete(id: string): void {
    this._books.update(books => books.filter(book => book.id !== id));
    this.persist();
  }

  private loadFromStorage(): Book[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return (JSON.parse(raw) as Book[]).map(b => ({
          ...b,
          readingStatus: (b.readingStatus as ReadingStatus) ?? 'to-read',
          finishedAt: b.finishedAt ? new Date(b.finishedAt) : null,
          rating: b.rating ?? null,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
        }));
      }
    } catch {
      // fallback to samples if storage is corrupted
    }
    return SAMPLE_BOOKS;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._books()));
  }
}
