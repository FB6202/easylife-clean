import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ColorTheme = 'LIGHT' | 'DARK' | 'SYSTEM';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly currentTheme = signal<ColorTheme>(this.loadSavedTheme());

  constructor() {
    this.applyTheme(this.currentTheme());

    if (this.isBrowser) {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
          if (this.currentTheme() === 'SYSTEM') {
            this.applyTheme('SYSTEM');
          }
        });
    }

    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  setTheme(theme: ColorTheme) {
    this.currentTheme.set(theme);
    if (this.isBrowser) {
      localStorage.setItem('easylife_theme', theme);
    }
  }

  private applyTheme(theme: ColorTheme) {
    if (!this.isBrowser) return;
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'DARK' || (theme === 'SYSTEM' && prefersDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  private loadSavedTheme(): ColorTheme {
    if (!this.isBrowser) return 'LIGHT';
    const saved = localStorage.getItem('easylife_theme') as ColorTheme | null;
    return saved ?? 'LIGHT';
  }

  isDark(): boolean {
    if (!this.isBrowser) return false;
    const theme = this.currentTheme();
    if (theme === 'DARK') return true;
    if (theme === 'SYSTEM') return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return false;
  }
}