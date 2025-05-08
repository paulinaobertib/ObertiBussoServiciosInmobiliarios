export interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  mail: string;
  phone: string;
}

export type OwnerCreate = Omit<Owner, "id">;
