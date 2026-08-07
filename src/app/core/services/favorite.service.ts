import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'country-explorer:favorites';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly favoritesSignal = signal<string[]>(this.readFromStorage());

  readonly favorites = this.favoritesSignal.asReadonly();

  isFavorite(code: string): boolean {
    return this.favoritesSignal().includes(code);
  }

  toggle(code: string): void {
    const next = this.isFavorite(code)
      ? this.favoritesSignal().filter((c) => c !== code)
      : [...this.favoritesSignal(), code];
    this.favoritesSignal.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  private readFromStorage(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
