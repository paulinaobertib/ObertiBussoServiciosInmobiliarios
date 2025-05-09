export interface Property {
  id: number;
  title: string;
  street: string;
  number: string;
  rooms: number;
  bathrooms: number;
  bedrooms: number;
  area: number;
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
