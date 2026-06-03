Audit the Angular project for common issues. Run these checks and report findings with file:line references.

## Checks to perform

**Templates**
- `as TypeName` inside template expressions → must use `$any()` instead
- Missing `track` expression in `@for` loops
- `ngIf` / `ngFor` / `ngSwitch` → must use `@if` / `@for` / `@switch` (Angular 17+ control flow)
- Calling methods in templates without `computed()` (causes unnecessary re-renders with OnPush)

**Components**
- Missing `ChangeDetectionStrategy.OnPush`
- Missing `standalone: true`
- Constructor injection instead of `inject()`
- `BehaviorSubject` / `Subject` where a `signal()` would suffice
- Unused imports in the `imports: []` array

**Styles**
- Hardcoded hex colors → should use `var(--mat-sys-*)` tokens
- Hardcoded pixel values for colors/theming that should be design tokens

**Angular Material**
- Module imported but no corresponding element in the template
- Missing module for an element used in the template (will cause runtime error)

**Services**
- Mutable public signal (should be `.asReadonly()`)
- Missing `providedIn: 'root'` on singleton services

After listing all findings, ask the user which ones to fix automatically.
