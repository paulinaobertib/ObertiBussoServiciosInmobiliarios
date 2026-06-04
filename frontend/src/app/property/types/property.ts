import { Amenity } from "./amenity";
import { Neighborhood } from "./neighborhood";
import { Owner } from "./owner";
import { Type } from "./type";

export interface Property {
  id: number;
  title: string;
  street: string;
  number: string;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  status: string;
  operation: string;
  currency: string;
  rooms: number;
  bathrooms: number;
  bedrooms: number;
  garages?: number | null;
  floor?: number | null;
  video?: string | null;
  zipCode?: string | null;
  privateArea?: number | null;
  propertyCondition?: string | null;
  rentsType?: string | null;
  networkShare?: boolean | null;
  area: number;
  coveredArea: number;
  price: number;
  expenses: number | null;
  showPrice: boolean;
  showExpenses: boolean;
  credit: boolean;
  financing: boolean;
  outstanding: boolean;
  owner: Owner;
  neighborhood: Neighborhood;
  type: Type;
  amenities: Amenity[];
  mainImage: File | string;
  images: File[];
  date: string;
  /** Admin-only from API */
  source?: string;
  wasiId?: number;
  wasiPortals?: string[];
  /** Admin-only from API: si la propiedad se muestra al público (default true) */
  visible?: boolean;
  /** Admin form: Wasi publish */
  publishToWasi?: boolean;
  wasiPortalIds?: number[];
}

export interface PropertyCreate {
  title: string;
  street: string;
  number: string;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  status: string;
  operation: string;
  currency: string;
  rooms: number;
  bathrooms: number;
  bedrooms: number;
  area: number;
  coveredArea: number;
  price: number;
  expenses: number | null;
  showPrice: boolean;
  showExpenses: boolean;
  credit: boolean;
  financing: boolean;
  outstanding: boolean;
  ownerId: number;
  neighborhoodId: number;
  typeId: number;
  amenitiesIds: number[];
  mainImage: File | string;
  images: File[];
  garages?: number | null;
  floor?: number | null;
  video?: string | null;
  zipCode?: string | null;
  privateArea?: number | null;
  propertyCondition?: string | null;
  rentsType?: string | null;
  networkShare?: boolean;
  publishToWasi?: boolean;
  wasiPortalIds?: number[];
}

export interface PropertyUpdate {
  id: number;
  title: string;
  street: string;
  number: string;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  status: string;
  operation: string;
  currency: string;
  rooms: number;
  bathrooms: number;
  bedrooms: number;
  area: number;
  coveredArea: number;
  price: number;
  expenses: number | null;
  showPrice: boolean;
  showExpenses: boolean;
  credit: boolean;
  financing: boolean;
  outstanding?: boolean;
  ownerId: number;
  neighborhoodId: number;
  typeId: number;
  amenitiesIds: number[];
  mainImage: File | string;
  garages?: number | null;
  floor?: number | null;
  video?: string | null;
  zipCode?: string | null;
  privateArea?: number | null;
  propertyCondition?: string | null;
  rentsType?: string | null;
  networkShare?: boolean;
  publishToWasi?: boolean;
  wasiPortalIds?: number[];
}

export interface PropertyDTOAI {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rooms: number;
  bathrooms: number;
  bedrooms: number;
  area: number;
  coveredArea: number;
  price: number;
  operation: string;
  type: string;
  amenities: Set<string>;
}

export interface PropertySimple {
  id: number;
  title: string;
  price: number;
  description: string;
  date: string;
  mainImage: string;
  status: string;
  operation: string;
  currency: string;
  neighborhood: string;
  type: string;
  source?: string;
  wasiId?: number;
}

export interface WasiPortal {
  id: number;
  name: string;
  active?: boolean;
}

export interface WasiLocationMapping {
  neighborhoodId: number;
  wasiCountryId: number;
  wasiRegionId: number;
  wasiCityId: number;
  wasiLocationId?: number;
  wasiZoneId?: number;
}
