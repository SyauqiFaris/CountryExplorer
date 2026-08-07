import { TestBed } from '@angular/core/testing';

import { FavoriteService } from './favorite.service';

const STORAGE_KEY = 'country-explorer:favorites';

describe('FavoriteService', () => {
  let service: FavoriteService;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoriteService);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('should be created with no favorites by default', () => {
    expect(service.favorites()).toEqual([]);
  });

  it('should add a code to favorites on toggle', () => {
    service.toggle('IDN');

    expect(service.favorites()).toEqual(['IDN']);
    expect(service.isFavorite('IDN')).toBeTrue();
  });

  it('should remove a code from favorites when toggled again', () => {
    service.toggle('IDN');
    service.toggle('IDN');

    expect(service.favorites()).toEqual([]);
    expect(service.isFavorite('IDN')).toBeFalse();
  });

  it('should persist favorites to localStorage', () => {
    service.toggle('IDN');
    service.toggle('MYS');

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw!)).toEqual(['IDN', 'MYS']);
  });

  it('should read existing favorites from localStorage on construction', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['JPN']));

    const fresh = TestBed.runInInjectionContext(() => new FavoriteService());

    expect(fresh.favorites()).toEqual(['JPN']);
  });

  it('should default to empty array when localStorage has corrupted data', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{');

    const fresh = TestBed.runInInjectionContext(() => new FavoriteService());

    expect(fresh.favorites()).toEqual([]);
  });
});
