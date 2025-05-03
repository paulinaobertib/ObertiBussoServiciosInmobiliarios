export interface Type {
  id: number;
  name: string;
  hasBedrooms: boolean;
  hasBathrooms: boolean;
  hasRooms: boolean;
}

export type TypeCreate = Pick<Type, "name">;
