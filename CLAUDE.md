# book-library — Angular 21 project

## Stack
- Angular 21 (standalone, signals, zoneless-ready)
- Angular Material 21 + CDK
- TypeScript 5.9
- RxJS 7.8 (used only at boundaries: `firstValueFrom`, `toSignal`)

## Architecture
```
src/app/
  core/
    models/       # interfaces + const arrays (e.g. book.model.ts)
    services/     # signal-based services with inject()
  features/
    <feature>/
      components/ # standalone components
      <feature>.routes.ts
  shared/
    components/   # reusable UI (dialogs, etc.)
```

## Mandatory conventions for every component

```ts
@Component({
  selector: 'app-<name>',
  imports: [ /* only what the template uses */ ],
  templateUrl: './<name>.component.html',
  styleUrl: './<name>.component.scss',
})
export class <Name>Component {
  private readonly myService = inject(MyService);
}
```

- **Never** `standalone: true` — default since Angular 19, omit it
- **Never** `changeDetection: ChangeDetectionStrategy.OnPush` — removed by convention in this project
- **Never** `ngOnChanges` — use `computed()` or `effect()` with signals
- **Never** `as TypeCast` in templates — use `$any(expr)` instead
- State: `signal()` / `computed()` — avoid `BehaviorSubject`
- Inject: `inject()` — never constructor injection

## Angular Material imports cheatsheet
| UI element       | Module to import                        |
|------------------|-----------------------------------------|
| Button / FAB     | `MatButtonModule`                       |
| Card             | `MatCardModule`                         |
| Input            | `MatInputModule` + `MatFormFieldModule` |
| Select           | `MatSelectModule` + `MatFormFieldModule`|
| Icon             | `MatIconModule`                         |
| Chip             | `MatChipsModule`                        |
| Dialog           | `MatDialog` (inject) — no module needed |
| Tooltip          | `MatTooltipModule`                      |
| Divider          | `MatDividerModule`                      |
| Progress spinner | `MatProgressSpinnerModule`              |
| Snackbar         | `MatSnackBar` (inject)                  |

## Material Design tokens (theming)
Always use CSS custom properties from the M3 theme:
```scss
color: var(--mat-sys-primary);
color: var(--mat-sys-on-surface);
color: var(--mat-sys-on-surface-variant);
color: var(--mat-sys-error);
background: var(--mat-sys-primary-container);
color: var(--mat-sys-on-primary-container);
border-color: var(--mat-sys-outline);
```
Never hardcode hex colors.

## Service pattern
```ts
@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly _books = signal<Book[]>([]);
  readonly books = this._books.asReadonly();
  readonly count = computed(() => this._books().length);
}
```

## Model pattern
```ts
export interface MyModel { id: string; /* ... */ }
export type MyModelFormData = Omit<MyModel, 'id' | 'createdAt' | 'updatedAt'>;
export const MY_ENUM = ['A', 'B'] as const;
export type MyEnum = typeof MY_ENUM[number];
```

## Common pitfalls
- Template type assertion: use `$any(expr)` not `(expr as Type)`
- Dialog data: use `satisfies DialogData` on the data object
- Reactive forms: always use `nonNullable: true` on string controls
- Route params: read in `ngOnInit` via `inject(ActivatedRoute).snapshot.paramMap`
