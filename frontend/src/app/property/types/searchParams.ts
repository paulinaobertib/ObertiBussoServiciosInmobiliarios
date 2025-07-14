export interface SearchParams {
  priceFrom: number;
  priceTo: number;
  areaFrom: number;
  areaTo: number;
  coveredAreaFrom: number;
  coveredAreaTo: number;

  rooms: number[];
  operation: string;
  types: string[];
  amenities: string[];
  cities: string[];
  neighborhoods: string[];
  neighborhoodTypes: string[];
  currency: string;
  credit?: boolean;
  financing?: boolean;
}
