export interface Property {
  id: number;

  title: string;
  street: string;
  number: string;
  description: string;
  status: string;
  operation: string;
  currency: string;

  rooms: number | string;
  bathrooms: number | string;
  bedrooms: number | string;
  area: number;
  price: number;

  ownerId: number;
  neighborhoodId: number;
  typeId: number;
  amenitiesIds: number[];

  mainImage: File | null; // obligatoria
  images: File[]; // opcional
}

export type PropertyCreate = Omit<Property, "id">;
