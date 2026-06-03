import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
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

  readonly fields: FormlyFieldConfig[] = [
    {
      template: '<h3 class="section-title">Informations principales</h3>',
    },
    {
      key: 'title',
      type: 'input',
      props: { label: 'Titre', placeholder: 'Le titre du livre', required: true },
      validation: { messages: { required: 'Le titre est obligatoire' } },
    },
    {
      key: 'author',
      type: 'input',
      props: { label: 'Auteur', placeholder: "Prénom et nom de l'auteur", required: true },
      validation: { messages: { required: "L'auteur est obligatoire" } },
    },
    {
      fieldGroupClassName: 'two-columns',
      fieldGroup: [
        {
          key: 'genre',
          type: 'select',
          props: {
            label: 'Genre',
            options: [
              { value: '', label: '-- Aucun --' },
              ...BOOK_GENRES.map(g => ({ value: g, label: g })),
            ],
          },
        },
        {
          key: 'publishedYear',
          type: 'input',
          props: {
            label: 'Année de publication',
            placeholder: 'ex : 2024',
            type: 'number',
          },
          validators: {
            validation: [Validators.min(1000), Validators.max(new Date().getFullYear())],
          },
          validation: {
            messages: {
              min: `Année invalide (entre 1000 et ${new Date().getFullYear()})`,
              max: `Année invalide (entre 1000 et ${new Date().getFullYear()})`,
            },
          },
        },
      ],
    },
    {
      template: '<div class="section-sep"></div><h3 class="section-title">Informations complémentaires</h3>',
    },
    {
      key: 'isbn',
      type: 'input',
      props: { label: 'ISBN', placeholder: 'ex : 978-2-07-036024-3' },
    },
    {
      key: 'description',
      type: 'textarea',
      props: { label: 'Description', placeholder: 'Résumé ou description du livre…', rows: 4 },
    },
    {
      template: '<div class="section-sep"></div><h3 class="section-title">Suivi de lecture</h3>',
    },
    {
      fieldGroupClassName: 'two-columns',
      fieldGroup: [
        {
          key: 'readingStatus',
          type: 'select',
          props: {
            label: 'Statut',
            options: READING_STATUSES.map(s => ({ value: s.value, label: s.label })),
          },
        },
        {
          key: 'finishedAt',
          type: 'input',
          props: { label: 'Date de fin', type: 'date' },
          expressions: { hide: "model.readingStatus !== 'read'" },
        },
      ],
    },
    {
      key: 'rating',
      type: 'star-rating',
      props: { label: 'Note personnelle' },
    },
  ];

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
