import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Country } from '../../models/country.model';

@Component({
  selector: 'app-country-card',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './country-card.component.html',
  styleUrl: './country-card.component.css',
})
export class CountryCardComponent {
  readonly country = input.required<Country>();
}
