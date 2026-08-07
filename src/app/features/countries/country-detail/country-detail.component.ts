import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CountryService } from '../../../core/services/country.service';
import { LoadState } from '../../../shared/models/load-state.model';
import { Country } from '../../../shared/models/country.model';

@Component({
  selector: 'app-country-detail',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './country-detail.component.html',
  styleUrl: './country-detail.component.css',
})
export class CountryDetailComponent {
  private readonly countryService = inject(CountryService);

  readonly code = input.required<string>();

  readonly state = toSignal(
    toObservable(this.code).pipe(
      switchMap((code) =>
        this.countryService.getByCode(code).pipe(
          map((data): LoadState<Country> => ({ status: 'success', data })),
          startWith<LoadState<Country>>({ status: 'loading' }),
          catchError(() =>
            of<LoadState<Country>>({
              status: 'error',
              message: 'Negara tidak ditemukan atau gagal memuat data.',
            }),
          ),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as LoadState<Country> },
  );

  languageList(country: Country): string {
    return country.languages ? Object.values(country.languages).join(', ') : '-';
  }

  currencyList(country: Country): string {
    return country.currencies
      ? Object.values(country.currencies)
          .map((currency) => `${currency.name} (${currency.symbol})`)
          .join(', ')
      : '-';
  }
}
