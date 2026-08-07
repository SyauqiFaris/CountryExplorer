import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CountryDetailComponent } from './country-detail.component';

function rawCountry(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    names: { common: 'Indonesia', official: 'Republic of Indonesia' },
    flag: { url_png: 'x.png', url_svg: 'x.svg' },
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

function paged(objects: unknown[]) {
  return { data: { objects, meta: { total: objects.length, count: objects.length, limit: 100, offset: 0, more: false } } };
}

describe('CountryDetailComponent', () => {
  let component: CountryDetailComponent;
  let fixture: ComponentFixture<CountryDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryDetailComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CountryDetailComponent);
    fixture.componentRef.setInput('code', 'IDN');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
    await fixture.whenStable();
    httpMock
      .expectOne((r) => r.urlWithParams.startsWith(`${environment.apiBaseUrl}/codes.alpha_3/IDN`))
      .flush(paged([rawCountry()]));
  });

  it('should render country detail fields', async () => {
    await fixture.whenStable();
    httpMock
      .expectOne((r) => r.urlWithParams.startsWith(`${environment.apiBaseUrl}/codes.alpha_3/IDN`))
      .flush(paged([rawCountry()]));
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Indonesia');
    expect(text).toContain('Republic of Indonesia');
    expect(text).toContain('Jakarta');
    expect(text).toContain('273,523,615');
    expect(text).toContain('1,904,569');
    expect(text).toContain('Indonesian');
    expect(text).toContain('Indonesian rupiah (Rp)');
  });

  it('should render border countries as clickable links using their raw code', async () => {
    await fixture.whenStable();
    httpMock
      .expectOne((r) => r.urlWithParams.startsWith(`${environment.apiBaseUrl}/codes.alpha_3/IDN`))
      .flush(paged([rawCountry()]));
    await fixture.whenStable();
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    const borderLinks = links.filter((a) => a.getAttribute('href')?.startsWith('/countries/'));
    const codes = borderLinks.map((a) => a.textContent?.trim());

    expect(codes).toEqual(['MYS', 'PNG', 'TLS']);
  });

  it('should show an error message when the country is not found', async () => {
    await fixture.whenStable();
    httpMock
      .expectOne((r) => r.urlWithParams.startsWith(`${environment.apiBaseUrl}/codes.alpha_3/IDN`))
      .flush(paged([]));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Negara tidak ditemukan');
  });

  it('should re-fetch when the code input changes (border country navigation)', async () => {
    await fixture.whenStable();
    httpMock
      .expectOne((r) => r.urlWithParams.startsWith(`${environment.apiBaseUrl}/codes.alpha_3/IDN`))
      .flush(paged([rawCountry()]));
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentRef.setInput('code', 'MYS');
    await fixture.whenStable();

    httpMock
      .expectOne((r) => r.urlWithParams.startsWith(`${environment.apiBaseUrl}/codes.alpha_3/MYS`))
      .flush(
        paged([
          rawCountry({ names: { common: 'Malaysia', official: 'Malaysia' }, codes: { alpha_3: 'MYS' } }),
        ]),
      );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Malaysia');
  });
});
