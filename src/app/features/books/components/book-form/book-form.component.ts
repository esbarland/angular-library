import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import {
  BOOK_GENRES,
  BookFormData,
  READING_STATUS_VALUES,
  ReadingStatus,
  readingStatusLabel,
} from '../../../../core/models/book.model';
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

  readonly bookId = signal<string | null>(null);
  readonly isEdit = computed(() => this.bookId() !== null);

  // Libellés des boutons (traduits à la compilation).
  readonly cancelLabel = $localize`:@@form.cancel:Cancel`;
  readonly saveLabel = $localize`:@@form.save:Save changes`;
  readonly addSubmitLabel = $localize`:@@form.add_submit:Add book`;
  readonly addTitle = $localize`:@@form.add_title:Add a book`;
  readonly editTitle = $localize`:@@form.edit_title:Edit book`;

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

  readonly fields = signal<FormlyFieldConfig[]>(this.buildFields());

  private buildFields(): FormlyFieldConfig[] {
    const currentYear = new Date().getFullYear();
    const yearInvalid = () =>
      $localize`:@@form.year.invalid:Invalid year (between 1000 and ${currentYear}:max:)`;

    return [
      { template: `<h3 class="section-title">${$localize`:@@form.sections.main:Main information`}</h3>` },
      {
        key: 'title',
        type: 'input',
        props: {
          label: $localize`:@@form.title.label:Title`,
          placeholder: $localize`:@@form.title.placeholder:The book title`,
          required: true,
          attributes: { 'data-testid': 'field-title' },
        },
        validation: { messages: { required: $localize`:@@form.title.required:Title is required` } },
      },
      {
        key: 'author',
        type: 'input',
        props: {
          label: $localize`:@@form.author.label:Author`,
          placeholder: $localize`:@@form.author.placeholder:Author's first and last name`,
          required: true,
          attributes: { 'data-testid': 'field-author' },
        },
        validation: { messages: { required: $localize`:@@form.author.required:Author is required` } },
      },
      {
        fieldGroupClassName: 'two-columns',
        fieldGroup: [
          {
            key: 'genre',
            type: 'select',
            props: {
              label: $localize`:@@form.genre.label:Genre`,
              attributes: { 'data-testid': 'field-genre' },
              options: [
                { value: '', label: $localize`:@@form.genre.none:-- None --` },
                ...BOOK_GENRES.map(g => ({ value: g, label: g })),
              ],
            },
          },
          {
            key: 'publishedYear',
            type: 'input',
            props: {
              label: $localize`:@@form.year.label:Publication year`,
              placeholder: $localize`:@@form.year.placeholder:e.g. 2024`,
              type: 'number',
              attributes: { 'data-testid': 'field-year' },
            },
            validators: { validation: [Validators.min(1000), Validators.max(currentYear)] },
            validation: { messages: { min: yearInvalid, max: yearInvalid } },
          },
        ],
      },
      { template: `<div class="section-sep"></div><h3 class="section-title">${$localize`:@@form.sections.extra:Additional information`}</h3>` },
      {
        key: 'isbn',
        type: 'input',
        props: {
          label: $localize`:@@form.isbn.label:ISBN`,
          placeholder: $localize`:@@form.isbn.placeholder:e.g. 978-2-07-036024-3`,
          attributes: { 'data-testid': 'field-isbn' },
        },
      },
      {
        key: 'description',
        type: 'textarea',
        props: {
          label: $localize`:@@form.description.label:Description`,
          placeholder: $localize`:@@form.description.placeholder:Summary or description of the book…`,
          rows: 4,
          attributes: { 'data-testid': 'field-description' },
        },
      },
      { template: `<div class="section-sep"></div><h3 class="section-title">${$localize`:@@form.sections.tracking:Reading tracking`}</h3>` },
      {
        fieldGroupClassName: 'two-columns',
        fieldGroup: [
          {
            key: 'readingStatus',
            type: 'select',
            props: {
              label: $localize`:@@form.status.label:Status`,
              attributes: { 'data-testid': 'field-status' },
              options: READING_STATUS_VALUES.map(value => ({ value, label: readingStatusLabel(value) })),
            },
          },
          {
            key: 'finishedAt',
            type: 'input',
            props: { label: $localize`:@@form.finished_at.label:End date`, type: 'date' },
            expressions: { hide: "model.readingStatus !== 'read'" },
          },
        ],
      },
      {
        key: 'rating',
        type: 'star-rating',
        props: { label: $localize`:@@form.rating.label:Personal rating` },
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
