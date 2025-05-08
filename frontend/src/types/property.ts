export interface Property {
  id: number;
  title: string;
  price: number;
  mainImage: string;
  status: string;
  description?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  // Agrega más campos según tu base de datos
}