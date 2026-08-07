import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBarComponent } from './search-bar.component';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not emit searchChange before 300ms debounce elapses', async () => {
    const emitted: string[] = [];
    component.searchChange.subscribe((value) => emitted.push(value));

    component.onSearchInput('indo');
    await wait(150);

    expect(emitted).toEqual([]);
  });

  it('should emit only the last value after rapid keystrokes within the debounce window', async () => {
    const emitted: string[] = [];
    component.searchChange.subscribe((value) => emitted.push(value));

    component.onSearchInput('i');
    await wait(100);
    component.onSearchInput('in');
    await wait(100);
    component.onSearchInput('indo');
    await wait(400);

    expect(emitted).toEqual(['indo']);
  });

  it('should not re-emit searchChange when the debounced value is unchanged', async () => {
    const emitted: string[] = [];
    component.searchChange.subscribe((value) => emitted.push(value));

    component.onSearchInput('indonesia');
    await wait(400);
    component.onSearchInput('indonesia');
    await wait(400);

    expect(emitted).toEqual(['indonesia']);
  });

  it('should emit regionChange immediately without debounce', () => {
    const emitted: string[] = [];
    component.regionChange.subscribe((value) => emitted.push(value));

    component.onRegionChange('Asia');

    expect(emitted).toEqual(['Asia']);
  });
});
