import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

const STORAGE_KEY = 'country-explorer:dark-mode';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    document.documentElement.classList.remove('dark');
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    document.documentElement.classList.remove('dark');
  });

  it('should default to light mode when no preference is stored', () => {
    expect(service.isDarkMode()).toBeFalse();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
  });

  it('should enable dark mode and apply the class on toggle', () => {
    service.toggle();
    TestBed.tick();

    expect(service.isDarkMode()).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
  });

  it('should disable dark mode and remove the class when toggled again', () => {
    service.toggle();
    service.toggle();
    TestBed.tick();

    expect(service.isDarkMode()).toBeFalse();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
  });

  it('should persist the preference to localStorage', () => {
    service.toggle();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('should read an existing preference from localStorage on construction', () => {
    localStorage.setItem(STORAGE_KEY, 'true');

    const fresh = TestBed.runInInjectionContext(() => new ThemeService());

    expect(fresh.isDarkMode()).toBeTrue();
  });

  it('should default to light mode when localStorage has corrupted data', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{');

    const fresh = TestBed.runInInjectionContext(() => new ThemeService());

    expect(fresh.isDarkMode()).toBeFalse();
  });
});
