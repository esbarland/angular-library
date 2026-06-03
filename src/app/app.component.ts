import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { BookService } from './core/services/book.service';
import { AppLang } from './core/i18n/translations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatButtonModule, MatIconModule, MatToolbarModule, MatTooltipModule, TranslocoPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly bookService = inject(BookService);
  private readonly translocoService = inject(TranslocoService);
  readonly isDark = signal(false);

  constructor() {
    this.isDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    effect(() => {
      document.documentElement.classList.toggle('dark-theme', this.isDark());
    });
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
  }

  toggleLang(): void {
    const next: AppLang = this.translocoService.getActiveLang() === 'fr' ? 'en' : 'fr';
    this.translocoService.setActiveLang(next);
    localStorage.setItem('app-lang', next);
  }
}
