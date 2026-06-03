Generate a new Angular standalone component for this project.

The user will specify: component name, feature folder (or shared), and purpose.

Follow ALL conventions from CLAUDE.md:
- `standalone: true`, `ChangeDetectionStrategy.OnPush`
- `inject()` for dependencies, never constructor injection
- signals + computed for state
- `$any()` for template type workarounds, never `as Type`
- inline `template` and `styles`
- `var(--mat-sys-*)` tokens for colors, never hardcoded hex
- import only the Angular Material modules actually used in the template

Place the file at the correct path:
- Feature component: `src/app/features/<feature>/components/<name>/<name>.component.ts`
- Shared component: `src/app/shared/components/<name>/<name>.component.ts`

After generating, check if the component needs to be added to a routes file and do it.

Ask the user: component name, feature or shared, and what it should do.
