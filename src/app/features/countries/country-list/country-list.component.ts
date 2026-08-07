import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';

import { CountryService } from '../../../core/services/country.service';
import { LoadState } from '../../../shared/models/load-state.model';
import { Country } from '../../../shared/models/country.model';
import { CountryCardComponent } from '../../../shared/components/country-card/country-card.component';

@Component({
  selector: 'app-country-list',
  imports: [CountryCardComponent],
  templateUrl: './country-list.component.html',
  styleUrl: './country-list.component.css',
})
export class CountryListComponent {
  private readonly countryService = inject(CountryService);

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
}
