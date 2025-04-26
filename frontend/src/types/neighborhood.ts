export interface Neighborhood {
  id: number;
  name: string;
  type: NeighborhoodType;
  city: string;
}

export enum NeighborhoodType {
  CERRADO = "CERRADO",
  SEMICERRADO = "SEMICERRADO",
  ABIERTO = "ABIERTO",
}
