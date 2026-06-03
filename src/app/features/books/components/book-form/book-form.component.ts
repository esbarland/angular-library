import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { BOOK_GENRES, BookFormData, READING_STATUSES, ReadingStatus } from '../../../../core/models/book.model';
import { BookService } from '../../../../core/services/book.service';

interface BookFormModel {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  genre: string;
  description: string;
  readingStatus: ReadingStatus;
  finishedAt: string;
  rating: number | null;
}

@Component({
  selector: 'app-book-form',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    FormlyModule,
    FormlyMaterialModule,
  ],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.scss',
})
export class BookFormComponent implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translocoService = inject(TranslocoService);

  private readonly currentLang = toSignal(
    this.translocoService.langChanges$,
    { initialValue: this.translocoService.getActiveLang() },
  );

  readonly bookId = signal<string | null>(null);
  readonly isEdit = computed(() => this.bookId() !== null);

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: BookFormModel = {
    title: '',
    author: '',
    isbn: '',
    publishedYear: null,
    genre: '',
    description: '',
    readingStatus: 'to-read',
    finishedAt: '',
    rating: null,
  };

  readonly fields = computed<FormlyFieldConfig[]>(() => {
    this.currentLang();
    return this.buildFields();
  });

  private buildFields(): FormlyFieldConfig[] {
    const t = (key: string, params?: object) => this.translocoService.translate(key, params);
    const currentYear = new Date().getFullYear();

    return [
      { template: `<h3 class="section-title">${t('form.sections.main')}</h3>` },
      {
        key: 'title',
        type: 'input',
        props: { label: t('form.title.label'), placeholder: t('form.title.placeholder'), required: true },
        validation: { messages: { required: t('form.title.required') } },
      },
      {
        key: 'author',
        type: 'input',
        props: { label: t('form.author.label'), placeholder: t('form.author.placeholder'), required: true },
        validation: { messages: { required: t('form.author.required') } },
      },
      {
        fieldGroupClassName: 'two-columns',
        fieldGroup: [
          {
            key: 'genre',
            type: 'select',
            props: {
              label: t('form.genre.label'),
              options: [
                { value: '', label: t('form.genre.none') },
                ...BOOK_GENRES.map(g => ({ value: g, label: g })),
              ],
            },
          },
          {
            key: 'publishedYear',
            type: 'input',
            props: { label: t('form.year.label'), placeholder: t('form.year.placeholder'), type: 'number' },
            validators: { validation: [Validators.min(1000), Validators.max(currentYear)] },
            validation: {
              messages: {
                min: () => t('form.year.invalid', { max: currentYear }),
                max: () => t('form.year.invalid', { max: currentYear }),
              },
            },
          },
        ],
      },
      { template: `<div class="section-sep"></div><h3 class="section-title">${t('form.sections.extra')}</h3>` },
      {
        key: 'isbn',
        type: 'input',
        props: { label: t('form.isbn.label'), placeholder: t('form.isbn.placeholder') },
      },
      {
        key: 'description',
        type: 'textarea',
        props: { label: t('form.description.label'), placeholder: t('form.description.placeholder'), rows: 4 },
      },
      { template: `<div class="section-sep"></div><h3 class="section-title">${t('form.sections.tracking')}</h3>` },
      {
        fieldGroupClassName: 'two-columns',
        fieldGroup: [
          {
            key: 'readingStatus',
            type: 'select',
            props: {
              label: t('form.status.label'),
              options: READING_STATUSES.map(s => ({
                value: s.value,
                label: t(`status.${s.value.replace('-', '_')}`),
              })),
            },
          },
          {
            key: 'finishedAt',
            type: 'input',
            props: { label: t('form.finished_at.label'), type: 'date' },
            expressions: { hide: "model.readingStatus !== 'read'" },
          },
        ],
      },
      {
        key: 'rating',
        type: 'star-rating',
        props: { label: t('form.rating.label') },
      },
    ];
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const book = this.bookService.getById(id);
    if (!book) {
      this.router.navigate(['/books']);
      return;
    }

    this.bookId.set(id);
    this.model = {
      title: book.title,
      author: book.author,
      isbn: book.isbn ?? '',
      publishedYear: book.publishedYear,
      genre: book.genre ?? '',
      description: book.description ?? '',
      readingStatus: book.readingStatus,
      finishedAt: book.finishedAt ? book.finishedAt.toISOString().split('T')[0] : '',
      rating: book.rating,
    };
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const m = this.model;
    const data: BookFormData = {
      title: m.title,
      author: m.author,
      isbn: m.isbn,
      publishedYear: m.publishedYear,
      genre: m.genre,
      description: m.description,
      readingStatus: m.readingStatus,
      finishedAt: m.finishedAt ? new Date(m.finishedAt + 'T00:00:00') : null,
      rating: m.rating,
    };

    const id = this.bookId();
    if (id) {
      this.bookService.update(id, data);
    } else {
      this.bookService.create(data);
    }

    this.router.navigate(['/books']);
  }
}
