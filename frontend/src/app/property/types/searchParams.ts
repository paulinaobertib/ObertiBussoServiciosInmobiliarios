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
  status?: string;
  credit?: boolean;
  financing?: boolean;
  garages?: number;
  condition?: string;
  forTransfer?: boolean;
  /** Admin: propia | all | todas | company label */
  source?: string;
}
