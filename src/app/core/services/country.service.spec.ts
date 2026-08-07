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

function meta(count: number, offset = 0, total = count, more = false) {
  return { total, count, limit: 100, offset, more };
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
    it('should request the base endpoint with response_fields and the Bearer token', () => {
      service.getAll().subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.urlWithParams.startsWith(environment.apiBaseUrl) &&
          r.urlWithParams.includes('response_fields=names.common') &&
          r.urlWithParams.includes('limit=100') &&
          r.urlWithParams.includes('offset=0'),
      );
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${environment.apiKey}`);
      req.flush({ data: { objects: [rawCountry()], meta: meta(1) } });
    });

    it('should map a fully-populated raw country to the Country shape', () => {
      let result: unknown[] = [];
      service.getAll().subscribe((countries) => (result = countries));

      httpMock
        .expectOne((r) => r.urlWithParams.startsWith(environment.apiBaseUrl))
        .flush({ data: { objects: [rawCountry()], meta: meta(1) } });

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

      httpMock.expectOne((r) => r.urlWithParams.startsWith(environment.apiBaseUrl)).flush({
        data: {
          objects: [
            rawCountry({ capitals: [], area: undefined, languages: [], currencies: [], borders: [] }),
          ],
          meta: meta(1),
        },
      });

      expect(result[0].capital).toBeUndefined();
      expect(result[0].area).toBeUndefined();
      expect(result[0].languages).toBeUndefined();
      expect(result[0].currencies).toBeUndefined();
      expect(result[0].borders).toBeUndefined();
    });

    it('should follow pagination and combine all pages when meta.more is true', () => {
      let result: any[] = [];
      service.getAll().subscribe((countries) => (result = countries));

      httpMock
        .expectOne((r) => r.urlWithParams.includes('offset=0'))
        .flush({
          data: {
            objects: [rawCountry({ codes: { alpha_3: 'IDN' } })],
            meta: meta(1, 0, 2, true),
          },
        });

      httpMock
        .expectOne((r) => r.urlWithParams.includes('offset=1'))
        .flush({
          data: {
            objects: [rawCountry({ names: { common: 'Japan', official: 'Japan' }, codes: { alpha_3: 'JPN' } })],
            meta: meta(1, 1, 2, false),
          },
        });

      expect(result.map((c) => c.cca3)).toEqual(['IDN', 'JPN']);
    });
  });

  describe('getByName', () => {
    it('should request /name?q={name}', () => {
      service.getByName('indonesia').subscribe();

      const req = httpMock.expectOne((r) =>
        r.urlWithParams.startsWith(`${environment.apiBaseUrl}/name?q=indonesia`),
      );
      req.flush({ data: { objects: [rawCountry()], meta: meta(1) } });
    });

    it('should emit an empty array (not an error) when the API finds no match', () => {
      let result: unknown[] | undefined;
      let errored = false;
      service.getByName('doesnotexist').subscribe({
        next: (countries) => (result = countries),
        error: () => (errored = true),
      });

      httpMock
        .expectOne((r) => r.urlWithParams.startsWith(`${environment.apiBaseUrl}/name?q=`))
        .flush({ data: { objects: [], meta: meta(0) } });

      expect(result).toEqual([]);
      expect(errored).toBeFalse();
    });

    it('should propagate server errors', () => {
      let errored = false;
      service.getByName('indonesia').subscribe({
        next: () => {},
        error: () => (errored = true),
      });

      httpMock
        .expectOne((r) => r.urlWithParams.startsWith(`${environment.apiBaseUrl}/name?q=`))
        .flush('server error', { status: 500, statusText: 'Server Error' });

      expect(errored).toBeTrue();
    });
  });

  describe('getByRegion', () => {
    it('should request /region/{region}', () => {
      service.getByRegion('Asia').subscribe();

      const req = httpMock.expectOne((r) =>
        r.urlWithParams.startsWith(`${environment.apiBaseUrl}/region/Asia`),
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: { objects: [rawCountry()], meta: meta(1) } });
    });
  });

  describe('getByCode', () => {
    it('should request /codes.alpha_3/{code} in uppercase and return the single mapped country', () => {
      let result: unknown;
      service.getByCode('idn').subscribe((country) => (result = country));

      const req = httpMock.expectOne((r) =>
        r.urlWithParams.startsWith(`${environment.apiBaseUrl}/codes.alpha_3/IDN`),
      );
      req.flush({ data: { objects: [rawCountry()], meta: meta(1) } });

      expect((result as { cca3: string }).cca3).toBe('IDN');
    });

    it('should error when the code does not match any country', () => {
      let errored = false;
      service.getByCode('ZZZ').subscribe({
        next: () => {},
        error: () => (errored = true),
      });

      httpMock
        .expectOne((r) => r.urlWithParams.startsWith(`${environment.apiBaseUrl}/codes.alpha_3/ZZZ`))
        .flush({ data: { objects: [], meta: meta(0) } });

      expect(errored).toBeTrue();
    });
  });
});
