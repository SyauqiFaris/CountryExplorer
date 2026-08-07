import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CountryListComponent } from './country-list.component';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rawCountry(name: string, region: string, code: string) {
  return {
    names: { common: name, official: name },
    flag: { url_png: 'x.png', url_svg: 'x.svg' },
    population: 1000,
    region,
    capitals: [{ name: 'Capital' }],
    codes: { alpha_3: code },
  };
}

describe('CountryListComponent', () => {
  let component: CountryListComponent;
  let fixture: ComponentFixture<CountryListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CountryListComponent);
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
      .expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`))
      .flush({ data: { objects: [] } });
  });

  it('should render country cards when the API returns data', async () => {
    await fixture.whenStable();
    const req = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`));
    req.flush({ data: { objects: [rawCountry('Indonesia', 'Asia', 'IDN')] } });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Indonesia');
  });

  it('should show empty state message when the API returns no countries', async () => {
    await fixture.whenStable();
    const req = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`));
    req.flush({ data: { objects: [] } });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Negara tidak ditemukan');
  });

  it('should show an error message when the request fails', async () => {
    await fixture.whenStable();
    const req = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`));
    req.flush('server error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Gagal memuat data negara');
  });

  it('should call getByName when the user types a search term', async () => {
    await fixture.whenStable();
    httpMock
      .expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`))
      .flush({ data: { objects: [] } });
    await fixture.whenStable();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('#search-input');
    input.value = 'indonesia';
    input.dispatchEvent(new Event('input'));
    await wait(400);

    const req = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/name/indonesia`));
    req.flush({ data: { objects: [rawCountry('Indonesia', 'Asia', 'IDN')] } });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Indonesia');
  });

  it('should call getByRegion when the user selects a region', async () => {
    await fixture.whenStable();
    httpMock
      .expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`))
      .flush({ data: { objects: [] } });
    await fixture.whenStable();
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#region-select');
    select.value = 'Asia';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    const req = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/region/Asia`));
    req.flush({ data: { objects: [rawCountry('Japan', 'Asia', 'JPN')] } });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Japan');
  });

  it('should combine search term and region filter (AND) client-side', async () => {
    await fixture.whenStable();
    httpMock
      .expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`))
      .flush({ data: { objects: [] } });
    await fixture.whenStable();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('#search-input');
    input.value = 'in';
    input.dispatchEvent(new Event('input'));
    await wait(400);

    const nameReq = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/name/in`));
    nameReq.flush({
      data: {
        objects: [rawCountry('Indonesia', 'Asia', 'IDN'), rawCountry('India', 'Asia', 'IND')],
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#region-select');
    select.value = 'Europe';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    // Region change re-triggers the same name search (combineLatest), not a region-only fetch.
    const combinedReq = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/name/in`));
    combinedReq.flush({
      data: {
        objects: [rawCountry('Indonesia', 'Asia', 'IDN'), rawCountry('Ireland', 'Europe', 'IRL')],
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ireland');
    expect(fixture.nativeElement.textContent).not.toContain('Indonesia');
  });
});
