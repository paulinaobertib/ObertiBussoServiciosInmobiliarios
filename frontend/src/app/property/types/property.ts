import { Amenity } from "./amenity";
import { Neighborhood } from "./neighborhood";
import { Owner } from "./owner";
import { Type } from "./type";

export interface Property {
  id: number;
  title: string;
  street: string;
  number: string;
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
  ownerId: number;
  neighborhoodId: number;
  typeId: number;
  amenitiesIds: number[];
  mainImage: File | string;
}

export const emptyProperty: Property = {
  id: 0,
  title: "",
  street: "",
  number: "",
  description: "",
  status: "",
  operation: "",
  currency: "",
  rooms: 0,
  bathrooms: 0,
  bedrooms: 0,
  area: 0,
  coveredArea: 0,
  price: 0,
  expenses: null,
  showPrice: false,
  credit: false,
  financing: false,
  owner: { id: 0, firstName: "", lastName: "", email: "", phone: "" } as Owner,
  neighborhood: {
    id: 0,
    name: "",
    city: "",
    type: "",
    latitude: 0,
    longitude: 0,
  } as Neighborhood,
  type: {
    id: 0,
    name: "",
    hasRooms: false,
    hasBathrooms: false,
    hasBedrooms: false,
    hasCoveredArea: false,
  } as Type,
  amenities: [],
  mainImage: "",
  images: [],
  date: "",
};
