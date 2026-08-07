import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';

import { CountryService } from '../../../core/services/country.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { LoadState } from '../../../shared/models/load-state.model';
import { Country } from '../../../shared/models/country.model';
import { CountryCardComponent } from '../../../shared/components/country-card/country-card.component';

@Component({
  selector: 'app-country-favorites',
  imports: [CountryCardComponent],
  templateUrl: './country-favorites.component.html',
  styleUrl: './country-favorites.component.css',
})
export class CountryFavoritesComponent {
  private readonly countryService = inject(CountryService);
  private readonly favoriteService = inject(FavoriteService);

  readonly state = toSignal(
    this.countryService.getAll().pipe(
      map((data): LoadState<Country[]> => ({ status: 'success', data })),
      startWith<LoadState<Country[]>>({ status: 'loading' }),
      catchError(() =>
        of<LoadState<Country[]>>({
          status: 'error',
          message: 'Gagal memuat data negara. Coba lagi nanti.',
        }),
      ),
    ),
    { initialValue: { status: 'loading' } as LoadState<Country[]> },
  );

  readonly favoriteCountries = computed(() => {
    const s = this.state();
    if (s.status !== 'success') {
      return [];
    }
    const codes = new Set(this.favoriteService.favorites());
    return s.data.filter((country) => codes.has(country.cca3));
  });
}
