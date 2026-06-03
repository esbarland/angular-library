import { ApplicationConfig, Injectable, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading, withViewTransitions } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import { routes } from './app.routes';
import { FormlyFieldStarRatingComponent } from './shared/components/formly-star-rating/formly-star-rating.component';
import { translations, AppLang } from './core/i18n/translations';

@Injectable({ providedIn: 'root' })
class InlineTranslocoLoader implements TranslocoLoader {
  getTranslation(lang: string) {
    return of(translations[lang as AppLang] ?? translations.fr);
  }
}

function detectLang(): AppLang {
  const saved = localStorage.getItem('app-lang');
  if (saved === 'fr' || saved === 'en') return saved;
  return navigator.language.startsWith('fr') ? 'fr' : 'en';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules), withViewTransitions()),
    provideTransloco({
      config: {
        availableLangs: ['fr', 'en'],
        defaultLang: detectLang(),
        fallbackLang: 'fr',
        reRenderOnLangChange: true,
        prodMode: true,
      },
      loader: InlineTranslocoLoader,
    }),
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
