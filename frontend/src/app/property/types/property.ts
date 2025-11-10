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
  area: number;
  coveredArea: number;
  price: number;
  expenses: number | null;
  showPrice: boolean;
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
  credit: boolean;
  financing: boolean;
  outstanding: boolean;
  ownerId: number;
  neighborhoodId: number;
  typeId: number;
  amenitiesIds: number[];
  mainImage: File | string;
  images: File[];
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
  credit: boolean;
  financing: boolean;
  outstanding?: boolean;
  ownerId: number;
  neighborhoodId: number;
  typeId: number;
  amenitiesIds: number[];
  mainImage: File | string;
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
