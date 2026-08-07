import { Component, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

export const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'] as const;

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent {
  readonly regions = REGIONS;

  readonly searchChange = output<string>();
  readonly regionChange = output<string>();

  private readonly searchInput$ = new Subject<string>();

  constructor() {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.searchChange.emit(value));
  }

  onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  onRegionChange(value: string): void {
    this.regionChange.emit(value);
  }
}
