import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book, BookInput } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/book`;

  private readonly _books = signal<Book[]>([]);
  readonly books = this._books.asReadonly();
  readonly count = computed(() => this._books().length);

  /** GET /book — charge la liste (recherche serveur via ?search=) dans le cache signal. */
  load(search?: string): Observable<Book[]> {
    const query = search?.trim();
    const params = query ? new HttpParams().set('search', query) : undefined;
    return this.http
      .get<Book[]>(this.baseUrl, { params })
      .pipe(tap(books => this._books.set(books)));
  }

  /** GET /book/{id} — pas de cache (navigation directe possible). */
  getById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/${id}`);
  }

  /** POST /book */
  create(data: BookInput): Observable<Book> {
    return this.http
      .post<Book>(this.baseUrl, data)
      .pipe(tap(book => this._books.update(books => [...books, book])));
  }

  /** PUT /book/{id} */
  update(id: number, data: BookInput): Observable<Book> {
    return this.http
      .put<Book>(`${this.baseUrl}/${id}`, data)
      .pipe(tap(book => this.replace(book)));
  }

  /** PUT /book/{id}/rating — note comprise entre 1 et 5. */
  rate(id: number, rating: number): Observable<Book> {
    return this.http
      .put<Book>(`${this.baseUrl}/${id}/rating`, { rating })
      .pipe(tap(book => this.replace(book)));
  }

  /** DELETE /book/{id} */
  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this._books.update(books => books.filter(b => b.id !== id))));
  }

  private replace(book: Book): void {
    this._books.update(books => books.map(b => (b.id === book.id ? book : b)));
  }
}
