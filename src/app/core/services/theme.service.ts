import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'country-explorer:dark-mode';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly darkModeSignal = signal<boolean>(this.readFromStorage());

  readonly isDarkMode = this.darkModeSignal.asReadonly();

  constructor() {
    effect(() => {
      document.documentElement.classList.toggle('dark', this.darkModeSignal());
    });
  }

  toggle(): void {
    const next = !this.darkModeSignal();
    this.darkModeSignal.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  private readFromStorage(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  }
}
