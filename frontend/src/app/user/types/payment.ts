export enum PaymentCurrency {
  USD = "USD",
  ARS = "ARS",
}

export enum PaymentConcept {
  ALQUILER = "ALQUILER",
  EXTRA = "EXTRA",
  COMISION = "COMISION",
}

export interface Payment {
  id: number;
  paymentCurrency: PaymentCurrency;
  amount: number;
  date: string; // ISO date-time
  description: string;
  concept: PaymentConcept;
  contractId: number;
  contractUtilityId?: number | null;
  commissionId?: number | null;
}

export interface PaymentCreate {
  paymentCurrency: PaymentCurrency;
  amount: number;
  date: string; // ISO date-time
  description: string;
  concept: PaymentConcept;
  contractId: number;
  contractUtilityId?: number;
  commissionId?: number;
}

export interface PaymentUpdate {
  id: number;
  paymentCurrency: PaymentCurrency;
  amount: number;
  date: string;
  description: string;
  concept: PaymentConcept;
  contractId: number;
  contractUtilityId?: number;
  commissionId?: number;
}
