import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryFavoritesComponent } from './country-favorites.component';

describe('CountryFavoritesComponent', () => {
  let component: CountryFavoritesComponent;
  let fixture: ComponentFixture<CountryFavoritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryFavoritesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CountryFavoritesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
