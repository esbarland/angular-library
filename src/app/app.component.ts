import { Component, LOCALE_ID, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BookService } from './core/services/book.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatButtonModule, MatIconModule, MatToolbarModule, MatTooltipModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly bookService = inject(BookService);
  private readonly localeId = inject(LOCALE_ID);
  readonly isDark = signal(false);

  // Libellés traduits à la compilation par $localize.
  readonly lightModeLabel = $localize`:@@app.light_mode:Switch to light mode`;
  readonly darkModeLabel = $localize`:@@app.dark_mode:Switch to dark mode`;
  // Nom de l'AUTRE langue : "Français" en build EN (source), "English" en build FR.
  readonly otherLangLabel = $localize`:@@app.lang_other:Français`;
  // Lien vers le build de l'autre locale (sous-chemin /fr/ en production).
  readonly otherLangHref = this.localeId.startsWith('en') ? '/fr/' : '/';

  constructor() {
    this.isDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    effect(() => {
      document.documentElement.classList.toggle('dark-theme', this.isDark());
    });
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
  }
}
