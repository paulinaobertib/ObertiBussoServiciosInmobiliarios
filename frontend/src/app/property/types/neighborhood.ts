export interface Neighborhood {
  id: number;
  name: string;
  city: string;
  type: NeighborhoodType;
}

export enum NeighborhoodType {
  CERRADO = "CERRADO",
  SEMICERRADO = "SEMICERRADO",
  ABIERTO = "ABIERTO",
}

export type NeighborhoodCreate = Omit<Neighborhood, 'id'>;