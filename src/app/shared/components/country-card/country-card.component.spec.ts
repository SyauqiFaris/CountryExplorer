import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Country } from '../../models/country.model';
import { CountryCardComponent } from './country-card.component';

const mockCountry: Country = {
  name: { common: 'Indonesia', official: 'Republic of Indonesia' },
  flags: { png: 'https://flagcdn.com/id.png', svg: 'https://flagcdn.com/id.svg' },
  population: 273523615,
  region: 'Asia',
  capital: ['Jakarta'],
  cca3: 'IDN',
};

describe('CountryCardComponent', () => {
  let component: CountryCardComponent;
  let fixture: ComponentFixture<CountryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CountryCardComponent);
    fixture.componentRef.setInput('country', mockCountry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render country name, region, and population', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Indonesia');
    expect(compiled.textContent).toContain('Asia');
    expect(compiled.textContent).toContain('273,523,615');
  });

  it('should link to the country detail route using cca3', () => {
    const anchor = fixture.nativeElement.querySelector('a');
    expect(anchor.getAttribute('href')).toBe('/countries/IDN');
  });
});
