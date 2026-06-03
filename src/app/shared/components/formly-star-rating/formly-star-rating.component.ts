import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'formly-field-star-rating',
  standalone: true,
  imports: [StarRatingComponent],
  template: `
    <div class="formly-star-wrap">
      <span class="formly-star-label">{{ props['label'] ?? 'Note personnelle' }}</span>
      <app-star-rating
        [value]="formControl.value"
        (valueChange)="onRatingChange($event)"
      />
      @if (formControl.value) {
        <span class="formly-star-value">{{ formControl.value }}/5</span>
      }
    </div>
  `,
  styles: [`
    .formly-star-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }
    .formly-star-label {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
      min-width: 120px;
    }
    .formly-star-value {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }
  `],
})
export class FormlyFieldStarRatingComponent extends FieldType<FieldTypeConfig> {
  onRatingChange(value: number | null): void {
    this.formControl.setValue(value);
    this.formControl.markAsDirty();
  }
}
