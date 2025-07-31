// --- Tipos de retorno ---
export type ViewsByProperty = Record<string, number>;
export type ViewsByPropertyType = Record<string, number>;
export type ViewsByDay = Record<string, number>;
export type ViewsByMonth = Record<string, number>;
export type ViewsByNeighborhood = Record<string, number>;
export type ViewsByNeighborhoodType = Record<string, number>;
export type ViewsByStatus = Record<string, number>;
export type ViewsByStatusAndType = Record<string, Record<string, number>>;
export type ViewsByOperation = Record<string, number>;
export type ViewsByRooms = Record<number, number>;
export type ViewsByAmenity = Record<string, number>;

// DTO para enviar la creación de un UserView
export interface UserViewDTO {
  userId: string;
  property: { id: number };
}
