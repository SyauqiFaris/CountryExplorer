import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CountryListComponent } from './country-list.component';

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
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    httpMock.expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`)).flush({
      data: { objects: [] },
    });
  });

  it('should render country cards when the API returns data', async () => {
    const req = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`));
    req.flush({
      data: {
        objects: [
          {
            names: { common: 'Indonesia', official: 'Republic of Indonesia' },
            flag: { url_png: 'x.png', url_svg: 'x.svg' },
            population: 273523615,
            region: 'Asia',
            capitals: [{ name: 'Jakarta' }],
            codes: { alpha_3: 'IDN' },
          },
        ],
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Indonesia');
  });

  it('should show empty state message when the API returns no countries', async () => {
    const req = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`));
    req.flush({ data: { objects: [] } });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Negara tidak ditemukan');
  });

  it('should show an error message when the request fails', async () => {
    const req = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiBaseUrl}/all`));
    req.flush('server error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Gagal memuat data negara');
  });
});
