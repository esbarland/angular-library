import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BookService } from '../../../../core/services/book.service';
import { Book, readingStatusLabel } from '../../../../core/models/book.model';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-book-detail',
  imports: [
    RouterLink,
    DatePipe,
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

  readonly statusLabel = readingStatusLabel;
  readonly book = signal<Book | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const found = id ? this.bookService.getById(id) : undefined;
    if (!found) {
      this.router.navigate(['/books']);
      return;
    }
    this.book.set(found);
  }

  updateRating(rating: number | null): void {
    const b = this.book();
    if (!b) return;
    const { id, createdAt, updatedAt, ...data } = b;
    this.book.set(this.bookService.update(id, { ...data, rating }));
  }
}
