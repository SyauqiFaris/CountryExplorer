import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';

import { CountryService } from '../../../core/services/country.service';
import { LoadState } from '../../../shared/models/load-state.model';
import { Country } from '../../../shared/models/country.model';
import { CountryCardComponent } from '../../../shared/components/country-card/country-card.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-country-list',
  imports: [CountryCardComponent, SearchBarComponent],
  templateUrl: './country-list.component.html',
  styleUrl: './country-list.component.css',
})
export class CountryListComponent {
  private readonly countryService = inject(CountryService);

  readonly searchTerm = signal('');
  readonly region = signal('');

  readonly state = toSignal(
    combineLatest([toObservable(this.searchTerm), toObservable(this.region)]).pipe(
      switchMap(([term, region]) =>
        this.fetchCountries(term, region).pipe(
          map((data): LoadState<Country[]> => ({ status: 'success', data })),
          startWith<LoadState<Country[]>>({ status: 'loading' }),
          catchError(() =>
            of<LoadState<Country[]>>({
              status: 'error',
              message: 'Gagal memuat data negara. Coba lagi nanti.',
            }),
          ),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as LoadState<Country[]> },
  );

  private fetchCountries(term: string, region: string): Observable<Country[]> {
    if (term) {
      return this.countryService
        .getByName(term)
        .pipe(map((countries) => (region ? countries.filter((c) => c.region === region) : countries)));
    }
    if (region) {
      return this.countryService.getByRegion(region);
    }
    return this.countryService.getAll();
  }
}
