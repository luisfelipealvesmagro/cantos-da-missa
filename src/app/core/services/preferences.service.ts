import { Injectable, signal } from '@angular/core';

const FONT_SCALE_KEY = 'cantos-font-scale';
const MIN = 0.7;
const MAX = 1.8;

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly fontScale = signal<number>(this.loadFontScale());

  fontUp(): void {
    this.setFontScale(+(this.fontScale() + 0.1).toFixed(1));
  }

  fontDown(): void {
    this.setFontScale(+(this.fontScale() - 0.1).toFixed(1));
  }

  private setFontScale(v: number): void {
    const clamped = Math.min(MAX, Math.max(MIN, v));
    this.fontScale.set(clamped);
    localStorage.setItem(FONT_SCALE_KEY, String(clamped));
  }

  private loadFontScale(): number {
    const saved = parseFloat(localStorage.getItem(FONT_SCALE_KEY) ?? '');
    return isNaN(saved) ? 1 : Math.min(MAX, Math.max(MIN, saved));
  }
}
