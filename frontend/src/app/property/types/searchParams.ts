export interface SearchParams {
  priceFrom: number;
  priceTo: number;
  areaFrom: number;
  areaTo: number;
  rooms: number;
  operation: string;
  type: string;
  amenities: string[];
  city: string;
  neighborhood: string;
  neighborhoodType: string;
}
