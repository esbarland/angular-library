import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import {
  BOOK_CATEGORIES,
  BookCategory,
  BookInput,
  READING_STATUS_VALUES,
  ReadingStatus,
  bookCategoryLabel,
  readingStatusLabel,
} from '../../../../core/models/book.model';
import { BookService } from '../../../../core/services/book.service';

interface BookFormModel {
  name: string;
  author: string;
  isbn: string;
  pages: number | null;
  year: number | null;
  description: string;
  category: BookCategory | '';
  status: ReadingStatus;
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
  private readonly destroyRef = inject(DestroyRef);

  readonly bookId = signal<number | null>(null);
  readonly isEdit = computed(() => this.bookId() !== null);
  // En édition, on n'affiche le formulaire qu'une fois le modèle chargé : Formly
  // initialise ses contrôles à partir du modèle au premier rendu.
  readonly ready = signal(true);

  // Libellés des boutons (traduits à la compilation).
  readonly cancelLabel = $localize`:@@form.cancel:Cancel`;
  readonly saveLabel = $localize`:@@form.save:Save changes`;
  readonly addSubmitLabel = $localize`:@@form.add_submit:Add book`;
  readonly addTitle = $localize`:@@form.add_title:Add a book`;
  readonly editTitle = $localize`:@@form.edit_title:Edit book`;

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: BookFormModel = {
    name: '',
    author: '',
    isbn: '',
    pages: null,
    year: null,
    description: '',
    category: '',
    status: 'TO_READ',
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
        key: 'name',
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
          attributes: { 'data-testid': 'field-author' },
        },
      },
      {
        fieldGroupClassName: 'two-columns',
        fieldGroup: [
          {
            key: 'category',
            type: 'select',
            props: {
              label: $localize`:@@form.category.label:Category`,
              attributes: { 'data-testid': 'field-genre' },
              options: [
                { value: '', label: $localize`:@@form.category.none:-- None --` },
                ...BOOK_CATEGORIES.map(c => ({ value: c, label: bookCategoryLabel(c) })),
              ],
            },
          },
          {
            key: 'year',
            type: 'input',
            props: {
              label: $localize`:@@form.year.label:Publication year`,
              placeholder: $localize`:@@form.year.placeholder:e.g. 2024`,
              type: 'number',
              required: true,
              attributes: { 'data-testid': 'field-year' },
            },
            validators: { validation: [Validators.min(1000), Validators.max(currentYear)] },
            validation: {
              messages: {
                required: $localize`:@@form.year.required:Year is required`,
                min: yearInvalid,
                max: yearInvalid,
              },
            },
          },
        ],
      },
      { template: `<div class="section-sep"></div><h3 class="section-title">${$localize`:@@form.sections.extra:Additional information`}</h3>` },
      {
        fieldGroupClassName: 'two-columns',
        fieldGroup: [
          {
            key: 'isbn',
            type: 'input',
            props: {
              label: $localize`:@@form.isbn.label:ISBN`,
              placeholder: $localize`:@@form.isbn.placeholder:e.g. 978-2-07-036024-3`,
              required: true,
              attributes: { 'data-testid': 'field-isbn' },
            },
            validation: { messages: { required: $localize`:@@form.isbn.required:ISBN is required` } },
          },
          {
            key: 'pages',
            type: 'input',
            props: {
              label: $localize`:@@form.pages.label:Number of pages`,
              placeholder: $localize`:@@form.pages.placeholder:e.g. 320`,
              type: 'number',
              required: true,
              attributes: { 'data-testid': 'field-pages' },
            },
            validators: { validation: [Validators.min(1)] },
            validation: {
              messages: {
                required: $localize`:@@form.pages.required:Number of pages is required`,
                min: $localize`:@@form.pages.invalid:Invalid number of pages`,
              },
            },
          },
        ],
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
        key: 'status',
        type: 'select',
        props: {
          label: $localize`:@@form.status.label:Status`,
          attributes: { 'data-testid': 'field-status' },
          options: READING_STATUS_VALUES.map(value => ({ value, label: readingStatusLabel(value) })),
        },
      },
      {
        key: 'rating',
        type: 'star-rating',
        props: { label: $localize`:@@form.rating.label:Personal rating` },
      },
    ];
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.ready.set(false);
    this.bookService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: book => {
          this.bookId.set(id);
          this.model = {
            name: book.name,
            author: book.author ?? '',
            isbn: book.isbn,
            pages: book.pages,
            year: book.year,
            description: book.description ?? '',
            category: book.category ?? '',
            status: book.status,
            rating: book.rating,
          };
          this.ready.set(true);
        },
        error: () => this.router.navigate(['/books']),
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const m = this.model;
    const data: BookInput = {
      name: m.name,
      author: m.author,
      isbn: m.isbn,
      pages: m.pages ?? 0,
      year: m.year ?? 0,
      description: m.description,
      category: m.category || null,
      status: m.status,
      rating: m.rating,
    };

    const id = this.bookId();
    const request$ = id
      ? this.bookService.update(id, data)
      : this.bookService.create(data);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.router.navigate(['/books']));
  }
}
