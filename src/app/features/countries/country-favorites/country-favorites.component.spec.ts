import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CountryFavoritesComponent } from './country-favorites.component';

const STORAGE_KEY = 'country-explorer:favorites';

function rawCountry(name: string, code: string) {
  return {
    names: { common: name, official: name },
    flag: { url_png: 'x.png', url_svg: 'x.svg' },
    population: 1000,
    region: 'Asia',
    capitals: [{ name: 'Capital' }],
    codes: { alpha_3: code },
  };
}

function paged(objects: unknown[]) {
  return { data: { objects, meta: { total: objects.length, count: objects.length, limit: 100, offset: 0, more: false } } };
}

describe('CountryFavoritesComponent', () => {
  let component: CountryFavoritesComponent;
  let fixture: ComponentFixture<CountryFavoritesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.removeItem(STORAGE_KEY);

    await TestBed.configureTestingModule({
      imports: [CountryFavoritesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(STORAGE_KEY);
  });

  function createComponent() {
    fixture = TestBed.createComponent(CountryFavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    createComponent();
    expect(component).toBeTruthy();
    await fixture.whenStable();
    httpMock.expectOne((r) => r.urlWithParams.startsWith(environment.apiBaseUrl)).flush(paged([]));
  });

  it('should show an informative empty state when there are no favorites', async () => {
    createComponent();
    await fixture.whenStable();
    httpMock
      .expectOne((r) => r.urlWithParams.startsWith(environment.apiBaseUrl))
      .flush(paged([rawCountry('Indonesia', 'IDN')]));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('belum punya negara favorit');
  });

  it('should only render countries that are favorited', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['IDN']));
    createComponent();
    await fixture.whenStable();
    httpMock
      .expectOne((r) => r.urlWithParams.startsWith(environment.apiBaseUrl))
      .flush(paged([rawCountry('Indonesia', 'IDN'), rawCountry('Japan', 'JPN')]));
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Indonesia');
    expect(text).not.toContain('Japan');
  });

  it('should remove a country from the list immediately when unfavorited, without a new request', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['IDN']));
    createComponent();
    await fixture.whenStable();
    httpMock
      .expectOne((r) => r.urlWithParams.startsWith(environment.apiBaseUrl))
      .flush(paged([rawCountry('Indonesia', 'IDN')]));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Indonesia');

    const favoriteButton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    favoriteButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('belum punya negara favorit');
  });
});
