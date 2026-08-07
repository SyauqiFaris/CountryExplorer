import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';

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

interface RestCountriesV5Meta {
  total: number;
  count: number;
  limit: number;
  offset: number;
  more: boolean;
}

interface RestCountriesV5Response {
  data: {
    objects: RestCountriesV5Country[];
    meta: RestCountriesV5Meta;
  };
}

const PAGE_SIZE = 100;

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
    const url = `${environment.apiBaseUrl}?response_fields=names.common,names.official,flag.url_png,flag.url_svg,population,region,capitals.name,codes.alpha_3`;
    return this.fetchAllPages(url);
  }

  getByName(name: string): Observable<Country[]> {
    const url = `${environment.apiBaseUrl}/name?q=${encodeURIComponent(name)}`;
    return this.fetchAllPages(url);
  }

  getByRegion(region: string): Observable<Country[]> {
    const url = `${environment.apiBaseUrl}/region/${encodeURIComponent(region)}`;
    return this.fetchAllPages(url);
  }

  getByCode(code: string): Observable<Country> {
    const url = `${environment.apiBaseUrl}/codes.alpha_3/${encodeURIComponent(code.toUpperCase())}`;
    return this.fetchAllPages(url).pipe(
      map((countries) => {
        const country = countries[0];
        if (!country) {
          throw new Error(`Country with code "${code}" not found`);
        }
        return country;
      }),
    );
  }

  private fetchAllPages(baseUrl: string): Observable<Country[]> {
    const pageUrl = (offset: number) => {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}limit=${PAGE_SIZE}&offset=${offset}`;
    };
    const fetchPage = (offset: number) =>
      this.http.get<RestCountriesV5Response>(pageUrl(offset), this.httpOptions);

    return fetchPage(0).pipe(
      expand((response) => {
        const { meta } = response.data;
        return meta.more ? fetchPage(meta.offset + meta.count) : EMPTY;
      }),
      reduce<RestCountriesV5Response, Country[]>(
        (acc, response) => [
          ...acc,
          ...response.data.objects
            .filter((raw) => raw.codes.alpha_3)
            .map((raw) => this.mapToCountry(raw)),
        ],
        [],
      ),
    );
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
