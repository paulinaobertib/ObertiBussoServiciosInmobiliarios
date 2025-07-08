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
  expenses: number;
  showPrice: boolean;
  credit: boolean;
  financing: boolean;
  owner: Owner;
  neighborhood: Neighborhood;
  type: Type;
  amenities: Amenity[];
  mainImage: File | string;
  images: File[];
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
  expenses: number;
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
  expenses: number;
  showPrice: boolean;
  credit: boolean;
  financing: boolean;
  ownerId: number;
  neighborhoodId: number;
  typeId: number;
  amenitiesIds: number[];
  mainImage: File | string;
}

export interface PropertyDTOAI {
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
  expenses: 0,
  showPrice: false,
  credit: false,
  financing: false,
  owner: { firstName: "", lastName: "", mail: "", phone: "" } as Owner,
  neighborhood: { id: 0, name: "", city: "", type: "" } as Neighborhood,
  type: {
    id: 0,
    name: "",
    hasRooms: false,
    hasBathrooms: false,
    hasBedrooms: false,
  } as Type,
  amenities: [],
  mainImage: "",
  images: [],
};
