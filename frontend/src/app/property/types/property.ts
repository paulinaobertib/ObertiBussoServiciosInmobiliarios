export interface Property {
  id: number;
  title: string;
  street: string;
  number: string;
  rooms: number | null;
  bathrooms: number | null;
  bedrooms: number | null;
  area: number | null;
  price: number;
  description: string;
  status: string;
  operation: string;
  currency: 'ARS' | 'USD';
  ownerId: number;
  neighborhoodId: number;
  neighborhood: Neighborhood;
  typeId: number;
  amenitiesIds: number[];
  mainImage: string;
  images: { id: number; url: string }[];
}

export interface Neighborhood {
  id: number;
  name: string;
  city: string;
  type: string;
}