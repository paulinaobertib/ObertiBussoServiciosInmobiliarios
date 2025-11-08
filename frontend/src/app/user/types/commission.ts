import type { PaymentCurrency, Payment } from "./payment";

export enum CommissionPaymentType {
  COMPLETO = "COMPLETO",
  CUOTAS = "CUOTAS",
}

export enum CommissionStatus {
  PENDIENTE = "PENDIENTE",
  PARCIAL = "PARCIAL",
  PAGADA = "PAGADA",
}

export interface Commission {
  id: number;
  currency: PaymentCurrency;
  totalAmount: number;
  date: string;
  paymentType: CommissionPaymentType;
  installments: number;
  status: CommissionStatus;
  note: string;
  contractId: number;
  payments?: Payment[];
}

export type CommissionCreate = Omit<Commission, "id">;
