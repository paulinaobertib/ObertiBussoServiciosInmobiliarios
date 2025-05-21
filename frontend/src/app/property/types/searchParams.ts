export interface SearchParams {
  priceFrom: number;
  priceTo: number;
  areaFrom: number;
  areaTo: number;
  coveredAreaFrom: number;
  coveredAreaTo: number;
  rooms: number;
  operation: string;
  type: string;
  amenities: string[];
  city: string;
  neighborhood: string;
  neighborhoodType: string;
  credit: boolean | undefined;
  financing: boolean | undefined;
}
