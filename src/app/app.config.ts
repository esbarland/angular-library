import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading, withViewTransitions } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { routes } from './app.routes';
import { FormlyFieldStarRatingComponent } from './shared/components/formly-star-rating/formly-star-rating.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules), withViewTransitions()),
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
          { name: 'required', message: $localize`:@@validation.required:This field is required` },
          { name: 'min', message: $localize`:@@validation.min:Value too small` },
          { name: 'max', message: $localize`:@@validation.max:Value too large` },
        ],
      }),
      FormlyMaterialModule,
    ),
  ],
};
