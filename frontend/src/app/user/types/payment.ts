export enum PaymentCurrency {
  USD = "USD",
  ARS = "ARS",
}

export interface Payment {
  id: number;
  contractId: number;
  amount: number;
  date: string;
  description: string;
  paymentCurrency: PaymentCurrency;
}

export type PaymentCreate = Omit<Payment, "id">;
