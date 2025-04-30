export interface PropertySaveDTO {
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
  mainImage: File | null;
  status: string;
  operation: string;
  currency: string;
  ownerId: number;
  neighborhoodId: number;
  typeId: number;
  amenitiesIds: number[];
  images: File[];
}
