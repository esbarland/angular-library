import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BookService } from '../../../../core/services/book.service';
import { Book, bookCategoryLabel, readingStatusLabel } from '../../../../core/models/book.model';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-book-detail',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    StarRatingComponent,
  ],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss',
})
export class BookDetailComponent implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusLabel = readingStatusLabel;
  readonly categoryLabel = bookCategoryLabel;
  readonly book = signal<Book | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/books']);
      return;
    }
    this.bookService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: book => this.book.set(book),
        error: () => this.router.navigate(['/books']),
      });
  }

  updateRating(rating: number | null): void {
    const b = this.book();
    if (!b) return;

    // L'endpoint /rating exige une note 1–5 ; pour l'effacer, on fait un PUT complet.
    const request$ = rating
      ? this.bookService.rate(b.id, rating)
      : this.bookService.update(b.id, { ...this.toInput(b), rating: null });

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(updated => this.book.set(updated));
  }

  private toInput(b: Book) {
    const { id, ...input } = b;
    return input;
  }
}
