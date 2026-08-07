import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'countries', pathMatch: 'full' },
  {
    path: 'countries',
    loadComponent: () =>
      import('./features/countries/country-list/country-list.component').then(
        (m) => m.CountryListComponent,
      ),
  },
  {
    path: 'countries/:code',
    loadComponent: () =>
      import('./features/countries/country-detail/country-detail.component').then(
        (m) => m.CountryDetailComponent,
      ),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/countries/country-favorites/country-favorites.component').then(
        (m) => m.CountryFavoritesComponent,
      ),
  },
];
