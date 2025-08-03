export interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export type OwnerCreate = Omit<Owner, "id">;

