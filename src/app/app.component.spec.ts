import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app.component';
import { ThemeService } from './core/services/theme.service';

const THEME_STORAGE_KEY = 'country-explorer:dark-mode';

describe('App', () => {
  beforeEach(async () => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.remove('dark');

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.remove('dark');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render nav links to countries and favorites', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const hrefs = Array.from(compiled.querySelectorAll('a')).map((a) => a.getAttribute('href'));

    expect(hrefs).toContain('/countries');
    expect(hrefs).toContain('/favorites');
  });

  it('should toggle dark mode when the theme button is clicked', async () => {
    const fixture = TestBed.createComponent(App);
    const themeService = TestBed.inject(ThemeService);
    await fixture.whenStable();

    const before = themeService.isDarkMode();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(themeService.isDarkMode()).toBe(!before);
  });
});
