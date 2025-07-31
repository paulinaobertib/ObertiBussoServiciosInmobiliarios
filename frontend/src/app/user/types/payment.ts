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

export interface PaymentCreate {
  contract: { id: number };
  amount: number;
  date: string;
  description: string;
  paymentCurrency: PaymentCurrency;
}

export interface PaymentUpdate {
  id: number;
  contract: { id: number };
  amount: number;
  date: string;
  description: string;
  paymentCurrency: PaymentCurrency;
}
