export interface Country {
  name: {
    common: string;
    official: string;
  };
  flags: {
    png: string;
    svg: string;
  };
  population: number;
  region: string;
  capital?: string[];
  area?: number;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
  borders?: string[];
  cca3: string;
}
