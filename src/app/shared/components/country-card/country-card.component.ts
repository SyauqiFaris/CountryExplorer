import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FavoriteService } from '../../../core/services/favorite.service';
import { Country } from '../../models/country.model';

@Component({
  selector: 'app-country-card',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './country-card.component.html',
  styleUrl: './country-card.component.css',
})
export class CountryCardComponent {
  private readonly favoriteService = inject(FavoriteService);

  readonly country = input.required<Country>();

  readonly isFavorite = computed(() => this.favoriteService.isFavorite(this.country().cca3));

  onToggleFavorite(): void {
    this.favoriteService.toggle(this.country().cca3);
  }
}
