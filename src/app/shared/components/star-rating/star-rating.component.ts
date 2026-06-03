import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  imports: [MatIconModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss',
  host: { class: 'star-rating-host' },
})
export class StarRatingComponent {
  readonly value = input<number | null>(null);
  readonly isReadonly = input(false);
  readonly valueChange = output<number | null>();

  readonly stars = [1, 2, 3, 4, 5];

  rate(star: number): void {
    this.valueChange.emit(this.value() === star ? null : star);
  }
}
