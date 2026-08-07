import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { CountryService } from './country.service';

function rawCountry(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    names: { common: 'Indonesia', official: 'Republic of Indonesia' },
    flag: { url_png: 'https://example.com/id.png', url_svg: 'https://example.com/id.svg' },
    population: 273523615,
    region: 'Asia',
    capitals: [{ name: 'Jakarta' }],
    area: { kilometers: 1904569 },
    languages: [{ bcp47: 'id', name: 'Indonesian' }],
    currencies: [{ code: 'IDR', name: 'Indonesian rupiah', symbol: 'Rp' }],
    borders: ['MYS', 'PNG', 'TLS'],
    codes: { alpha_3: 'IDN' },
    ...overrides,
  };
}

describe('CountryService', () => {
  let service: CountryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CountryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('should request /all with the field filter and the Bearer token', () => {
      service.getAll().subscribe();

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/all?fields=names,flag,population,region,capitals`,
      );
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${environment.apiKey}`);
      req.flush({ data: { objects: [rawCountry()] } });
    });

    it('should map a fully-populated raw country to the Country shape', () => {
      let result: unknown[] = [];
      service.getAll().subscribe((countries) => (result = countries));

      httpMock
        .expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`))
        .flush({ data: { objects: [rawCountry()] } });

      expect(result).toEqual([
        {
          name: { common: 'Indonesia', official: 'Republic of Indonesia' },
          flags: { png: 'https://example.com/id.png', svg: 'https://example.com/id.svg' },
          population: 273523615,
          region: 'Asia',
          capital: ['Jakarta'],
          area: 1904569,
          languages: { id: 'Indonesian' },
          currencies: { IDR: { name: 'Indonesian rupiah', symbol: 'Rp' } },
          borders: ['MYS', 'PNG', 'TLS'],
          cca3: 'IDN',
        },
      ]);
    });

    it('should map missing optional fields to undefined instead of empty arrays', () => {
      let result: any[] = [];
      service.getAll().subscribe((countries) => (result = countries));

      httpMock
        .expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`))
        .flush({
          data: {
            objects: [
              rawCountry({ capitals: [], area: undefined, languages: [], currencies: [], borders: [] }),
            ],
          },
        });

      expect(result[0].capital).toBeUndefined();
      expect(result[0].area).toBeUndefined();
      expect(result[0].languages).toBeUndefined();
      expect(result[0].currencies).toBeUndefined();
      expect(result[0].borders).toBeUndefined();
    });
  });

  describe('getByName', () => {
    it('should request /name/{name}', () => {
      service.getByName('indonesia').subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/name/indonesia`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { objects: [rawCountry()] } });
    });

    it('should emit an empty array (not an error) when the API returns 404', () => {
      let result: unknown[] | undefined;
      let errored = false;
      service.getByName('doesnotexist').subscribe({
        next: (countries) => (result = countries),
        error: () => (errored = true),
      });

      httpMock
        .expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/name/`))
        .flush('not found', { status: 404, statusText: 'Not Found' });

      expect(result).toEqual([]);
      expect(errored).toBeFalse();
    });

    it('should propagate non-404 errors', () => {
      let errored = false;
      service.getByName('indonesia').subscribe({
        next: () => {},
        error: () => (errored = true),
      });

      httpMock
        .expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/name/`))
        .flush('server error', { status: 500, statusText: 'Server Error' });

      expect(errored).toBeTrue();
    });
  });

  describe('getByRegion', () => {
    it('should request /region/{region}', () => {
      service.getByRegion('Asia').subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/region/Asia`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { objects: [rawCountry()] } });
    });
  });

  describe('getByCode', () => {
    it('should request /alpha/{code} and return the single mapped country', () => {
      let result: unknown;
      service.getByCode('IDN').subscribe((country) => (result = country));

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/alpha/IDN`);
      req.flush({ data: { objects: [rawCountry()] } });

      expect((result as { cca3: string }).cca3).toBe('IDN');
    });

    it('should error when the code does not match any country', () => {
      let errored = false;
      service.getByCode('ZZZ').subscribe({
        next: () => {},
        error: () => (errored = true),
      });

      httpMock
        .expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/alpha/ZZZ`))
        .flush({ data: { objects: [] } });

      expect(errored).toBeTrue();
    });
  });
});
