export interface Favorite {
  id: number;
  userId: string;
  propertyId: number;
}

export type FavoriteCreate = Omit<Favorite, "id">;
