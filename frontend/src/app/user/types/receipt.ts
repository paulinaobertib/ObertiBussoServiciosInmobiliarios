import type { PaymentCurrency } from "./payment";

export type ReceiptIssuer = "INMOBILIARIA" | "CORREDOR";
export type ReceiptKind = "RECIBO" | "LIQUIDACION";
export type ReceiptConcept = "ALQUILER" | "EXPENSAS" | "SERVICIOS" | "OTRO";
export type ReceiptStatus = "EMITIDO" | "ANULADO";

export interface ReceiptItem {
  description: string;
  amount: number;
}

// lo que se manda para crear o previsualizar
export interface ReceiptCreate {
  issuer: ReceiptIssuer;
  kind: ReceiptKind;
  concept: ReceiptConcept;
  issueDate: string; // YYYY-MM-DD
  periodMonth: number | null;
  periodYear: number | null;
  currency: PaymentCurrency;
  payerName: string;
  payerDni: string | null;
  ownerName: string | null;
  propertyAddress: string | null;
  notes: string | null;
  userId: string | null;
  contractId: number | null;
  paymentId: number | null;
  items: ReceiptItem[];
}

export interface Receipt extends ReceiptCreate {
  id: number;
  number: string;
  status: ReceiptStatus;
  total: number;
  totalInWords: string;
  createdAt: string;
  annulledAt: string | null;
  annulReason: string | null;
}

export interface ReceiptFilters {
  issuer?: ReceiptIssuer | "";
  kind?: ReceiptKind | "";
  status?: ReceiptStatus | "";
  from?: string;
  to?: string;
  q?: string;
}

export const ISSUER_LABEL: Record<ReceiptIssuer, string> = {
  INMOBILIARIA: "Oberti Busso Inmobiliaria",
  CORREDOR: "Luis María Oberti",
};

export const KIND_LABEL: Record<ReceiptKind, string> = {
  RECIBO: "Recibo de pago",
  LIQUIDACION: "Liquidación (no válida como recibo)",
};

export const CONCEPT_LABEL: Record<ReceiptConcept, string> = {
  ALQUILER: "Alquiler",
  EXPENSAS: "Expensas",
  SERVICIOS: "Servicios e impuestos",
  OTRO: "Otro",
};

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
