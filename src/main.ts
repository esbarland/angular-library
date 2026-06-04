import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Les données de locale (fr/en) sont incluses automatiquement par le CLI
// pour la locale active lors d'un build i18n (option `localize`).
bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
