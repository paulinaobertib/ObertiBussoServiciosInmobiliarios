export interface Maintenance {
  id: number;
  title: string;
  description: string;
  date: string;
  propertyId: number;
}

export type MaintenanceCreate = Omit<Maintenance, "id">;
