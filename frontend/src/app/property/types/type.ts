export interface Type {
  id: number;
  name: string;
  hasBedrooms: boolean;
  hasBathrooms: boolean;
  hasRooms: boolean;
  hasCoveredArea: boolean;
}
export type TypeCreate = Omit<Type, "id">;

