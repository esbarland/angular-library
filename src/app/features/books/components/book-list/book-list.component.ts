import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
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
  BookCategory,
  SortOption,
  SORT_VALUES,
  bookCategoryLabel,
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
      case 'name-asc': return a.name.localeCompare(b.name, 'fr');
      case 'author-asc': return a.author.localeCompare(b.author, 'fr');
      case 'year-desc': return (b.year ?? 0) - (a.year ?? 0);
      case 'id-desc': return b.id - a.id;
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
  private readonly destroyRef = inject(DestroyRef);

  readonly sortOptions = SORT_VALUES.map(value => ({ value, label: sortOptionLabel(value) }));
  readonly statusLabel = readingStatusLabel;
  readonly categoryLabel = bookCategoryLabel;

  // Tooltips (expressions → $localize en TS).
  readonly editLabel = $localize`:@@list.edit:Edit`;
  readonly deleteLabel = $localize`:@@list.delete:Delete`;

  readonly searchQuery = signal('');
  readonly selectedCategory = signal<BookCategory | ''>('');
  readonly sortOption = signal<SortOption>('id-desc');
  readonly currentPage = signal(0);
  readonly pageSize = signal(12);

  readonly availableCategories = computed(() => {
    const categories = new Set(
      this.bookService.books().map(b => b.category).filter((c): c is BookCategory => !!c)
    );
    return Array.from(categories).sort((a, b) =>
      bookCategoryLabel(a).localeCompare(bookCategoryLabel(b), 'fr')
    );
  });

  // Recherche côté serveur : le filtre catégorie + le tri restent côté client.
  readonly filteredBooks = computed(() => {
    const category = this.selectedCategory();
    const books = category
      ? this.bookService.books().filter(b => b.category === category)
      : this.bookService.books();
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
    // Réinitialise la pagination quand les filtres changent.
    effect(() => {
      this.searchQuery();
      this.selectedCategory();
      this.sortOption();
      this.currentPage.set(0);
    });

    // Recherche serveur débouncée (émet aussi une 1re fois au démarrage avec '').
    toObservable(this.searchQuery)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => this.bookService.load(query)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onCategoryChange(value: BookCategory | '' | undefined): void {
    this.selectedCategory.set(value ?? '');
  }

  viewBook(book: Book): void {
    this.router.navigate(['/books', book.id]);
  }

  editBook(book: Book): void {
    this.router.navigate(['/books', book.id, 'edit']);
  }

  deleteBook(book: Book): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: $localize`:@@confirm.delete_title:Delete book`,
        message: $localize`:@@confirm.delete_msg:Are you sure you want to delete "${book.name}:title:" by ${book.author}:author:?`,
        confirmText: $localize`:@@confirm.delete_btn:Delete`,
        cancelText: $localize`:@@confirm.cancel:Cancel`,
      } satisfies ConfirmDialogData,
      width: '400px',
    });
    ref.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) {
          this.bookService.delete(book.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
        }
      });
  }
}
