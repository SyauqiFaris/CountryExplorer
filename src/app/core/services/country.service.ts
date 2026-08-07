import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Country } from '../../shared/models/country.model';

interface RestCountriesV5Country {
  names: {
    common: string;
    official: string;
  };
  flag: {
    url_png: string;
    url_svg: string;
  };
  population: number;
  region: string;
  capitals?: { name: string }[];
  area?: { kilometers: number };
  languages?: { bcp47: string; name: string }[];
  currencies?: { code: string; name: string; symbol: string }[];
  borders?: string[];
  codes: {
    alpha_3: string;
  };
}

interface RestCountriesV5Response {
  data: {
    objects: RestCountriesV5Country[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private readonly httpOptions = {
    headers: new HttpHeaders({
      Authorization: `Bearer ${environment.apiKey}`,
    }),
  };

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Country[]> {
    const url = `${environment.apiBaseUrl}/all?fields=names,flag,population,region,capitals`;
    return this.fetchCountries(url);
  }

  getByName(name: string): Observable<Country[]> {
    const url = `${environment.apiBaseUrl}/name/${encodeURIComponent(name)}`;
    return this.fetchCountries(url).pipe(
      catchError((error: HttpErrorResponse) => (error.status === 404 ? of([]) : throwError(() => error))),
    );
  }

  getByRegion(region: string): Observable<Country[]> {
    const url = `${environment.apiBaseUrl}/region/${encodeURIComponent(region)}`;
    return this.fetchCountries(url);
  }

  getByCode(code: string): Observable<Country> {
    const url = `${environment.apiBaseUrl}/alpha/${encodeURIComponent(code)}`;
    return this.fetchCountries(url).pipe(
      map((countries) => {
        const country = countries[0];
        if (!country) {
          throw new Error(`Country with code "${code}" not found`);
        }
        return country;
      }),
    );
  }

  private fetchCountries(url: string): Observable<Country[]> {
    return this.http
      .get<RestCountriesV5Response>(url, this.httpOptions)
      .pipe(map((response) => response.data.objects.map((raw) => this.mapToCountry(raw))));
  }

  private mapToCountry(raw: RestCountriesV5Country): Country {
    return {
      name: {
        common: raw.names.common,
        official: raw.names.official,
      },
      flags: {
        png: raw.flag.url_png,
        svg: raw.flag.url_svg,
      },
      population: raw.population,
      region: raw.region,
      capital: raw.capitals?.length ? raw.capitals.map((capital) => capital.name) : undefined,
      area: raw.area?.kilometers,
      languages: raw.languages?.length
        ? Object.fromEntries(raw.languages.map((language) => [language.bcp47, language.name]))
        : undefined,
      currencies: raw.currencies?.length
        ? Object.fromEntries(
            raw.currencies.map((currency) => [
              currency.code,
              { name: currency.name, symbol: currency.symbol },
            ]),
          )
        : undefined,
      borders: raw.borders?.length ? raw.borders : undefined,
      cca3: raw.codes.alpha_3,
    };
  }
}
