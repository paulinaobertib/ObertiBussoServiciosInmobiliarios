export interface Neighborhood {
  id: null;
  name: string;
  city: string;
  type: NeighborhoodType;
}

export enum NeighborhoodType {
  CERRADO = "CERRADO",
  SEMICERRADO = "SEMICERRADO",
  ABIERTO = "ABIERTO",
}
