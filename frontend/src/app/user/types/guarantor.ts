export interface Guarantor {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export type GuarantorCreate = Omit<Guarantor, "id">;
