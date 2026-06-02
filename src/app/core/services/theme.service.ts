import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
const KEY = 'cantos-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>('light');

  init(): void {
    const saved = localStorage.getItem(KEY) as Theme | null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    this.apply(saved ?? (prefersDark ? 'dark' : 'light'));
  }

  toggle(): void {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    const color = theme === 'dark' ? '#26215C' : '#3C3489';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }
}
