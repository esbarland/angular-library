import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Validators } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { routes } from './app.routes';
import { FormlyFieldStarRatingComponent } from './shared/components/formly-star-rating/formly-star-rating.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules), withViewTransitions()),
    provideAnimationsAsync(),
    importProvidersFrom(
      FormlyModule.forRoot({
        types: [
          { name: 'star-rating', component: FormlyFieldStarRatingComponent, wrappers: [] },
        ],
        extensions: [
          {
            name: 'default-appearance',
            extension: {
              onPopulate: (field) => {
                if (field.type && field.props && !field.props['appearance']) {
                  field.props['appearance'] = 'outline';
                }
              },
            },
          },
        ],
        validationMessages: [
          { name: 'required', message: 'Ce champ est obligatoire' },
          { name: 'min', message: 'Valeur trop petite' },
          { name: 'max', message: 'Valeur trop grande' },
        ],
      }),
      FormlyMaterialModule,
    ),
  ],
};
