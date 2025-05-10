export interface Amenity {
  id: number;
  name: string;
}

export type AmenityCreate = Pick<Amenity, "name">;

