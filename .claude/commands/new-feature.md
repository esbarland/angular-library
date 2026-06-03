Scaffold a complete new feature for this Angular project.

The user will specify: feature name and the data model fields needed.

Generate the following files in order:

1. `src/app/core/models/<feature>.model.ts`
   - Interface with `id: string`, timestamps, and user-specified fields
   - `FormData` type using `Omit<..., 'id' | 'createdAt' | 'updatedAt'>`
   - `const ENUM = [...] as const` + type alias if enum fields exist

2. `src/app/core/services/<feature>.service.ts`
   - `@Injectable({ providedIn: 'root' })`
   - `private readonly _items = signal<Model[]>([])`
   - `readonly items = this._items.asReadonly()`
   - `readonly count = computed(() => ...)`
   - CRUD methods: `create()`, `update()`, `delete()`, `getById()`
   - Use `crypto.randomUUID()` for ID generation

3. `src/app/features/<feature>/components/<feature>-list/<feature>-list.component.ts`
   - List with search (signal + computed filter)
   - Delete with ConfirmDialogComponent
   - FAB to navigate to new form

4. `src/app/features/<feature>/components/<feature>-form/<feature>-form.component.ts`
   - Reactive form (FormGroup with nonNullable controls)
   - Handles both create and edit modes via route param

5. `src/app/features/<feature>/<feature>.routes.ts`
   - Lazy-loaded routes: `''` → list, `'new'` → form, `':id/edit'` → form

6. Update `src/app/app.routes.ts` to add the new feature route with `loadChildren`.

All files must follow conventions in CLAUDE.md. Ask the user for the feature name and model fields before generating.
