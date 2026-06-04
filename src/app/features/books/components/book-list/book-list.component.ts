import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { BookService } from '../../../../core/services/book.service';
import {
  Book,
  SortOption,
  SORT_VALUES,
  readingStatusLabel,
  sortOptionLabel,
} from '../../../../core/models/book.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';

function sortBooks(books: Book[], option: SortOption): Book[] {
  return [...books].sort((a, b) => {
    switch (option) {
      case 'title-asc': return a.title.localeCompare(b.title, 'fr');
      case 'author-asc': return a.author.localeCompare(b.author, 'fr');
      case 'publishedYear-desc': return (b.publishedYear ?? 0) - (a.publishedYear ?? 0);
      case 'createdAt-desc': return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });
}

@Component({
  selector: 'app-book-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTooltipModule,
    StarRatingComponent,
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
})
export class BookListComponent {
  protected readonly bookService = inject(BookService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly sortOptions = SORT_VALUES.map(value => ({ value, label: sortOptionLabel(value) }));
  readonly statusLabel = readingStatusLabel;

  // Tooltips (expressions → $localize en TS).
  readonly editLabel = $localize`:@@list.edit:Edit`;
  readonly deleteLabel = $localize`:@@list.delete:Delete`;

  readonly searchQuery = signal('');
  readonly selectedGenre = signal('');
  readonly sortOption = signal<SortOption>('createdAt-desc');
  readonly currentPage = signal(0);
  readonly pageSize = signal(12);

  readonly availableGenres = computed(() => {
    const genres = new Set(this.bookService.books().map(b => b.genre).filter(Boolean));
    return Array.from(genres).sort((a, b) => a.localeCompare(b, 'fr'));
  });

  private readonly searchFilteredBooks = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.bookService.books();
    return this.bookService.books().filter(
      book =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.genre.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q)
    );
  });

  readonly filteredBooks = computed(() => {
    const genre = this.selectedGenre();
    const books = genre
      ? this.searchFilteredBooks().filter(b => b.genre === genre)
      : this.searchFilteredBooks();
    return sortBooks(books, this.sortOption());
  });

  readonly paginatedBooks = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    return this.filteredBooks().slice(page * size, (page + 1) * size);
  });

  readonly totalCount = computed(() => this.filteredBooks().length);
  readonly showPaginator = computed(() => this.totalCount() > this.pageSize());

  constructor() {
    effect(() => {
      this.searchQuery();
      this.selectedGenre();
      this.sortOption();
      this.currentPage.set(0);
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onGenreChange(value: string | undefined): void {
    this.selectedGenre.set(value ?? '');
  }

  viewBook(book: Book): void {
    this.router.navigate(['/books', book.id]);
  }

  editBook(book: Book): void {
    this.router.navigate(['/books', book.id, 'edit']);
  }

  async deleteBook(book: Book): Promise<void> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: $localize`:@@confirm.delete_title:Delete book`,
        message: $localize`:@@confirm.delete_msg:Are you sure you want to delete "${book.title}:title:" by ${book.author}:author:?`,
        confirmText: $localize`:@@confirm.delete_btn:Delete`,
        cancelText: $localize`:@@confirm.cancel:Cancel`,
      } satisfies ConfirmDialogData,
      width: '400px',
    });
    const confirmed = await firstValueFrom(ref.afterClosed());
    if (confirmed) this.bookService.delete(book.id);
  }
}
