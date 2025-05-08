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
  price: number;

  ownerId: number;
  neighborhoodId: number;
  typeId: number;
  amenitiesIds: number[];

  mainImage: File | string; // obligatoria
  images: File[]; // opcional
}

export type PropertyCreate = Omit<Property, "id">;

export type PropertyUpdate = Omit<Property, "images">;
