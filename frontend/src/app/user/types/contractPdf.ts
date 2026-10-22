import type { ContractType } from "./contract";
import type { PaymentCurrency } from "./payment";

export interface ExtractedPerson {
  fullName: string | null;
  dni: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface ContractExtraField {
  label: string;
  value: string;
}

// claves que el backend marca como faltantes (coinciden con el formulario)
export type MissingField =
  | "tenant"
  | "property"
  | "contractType"
  | "startDate"
  | "endDate"
  | "currency"
  | "initialAmount"
  | "adjustmentIndex"
  | "adjustmentFrequencyMonths";

export const MISSING_LABEL: Record<MissingField, string> = {
  tenant: "Inquilino",
  property: "Dirección del inmueble",
  contractType: "Tipo de contrato",
  startDate: "Fecha de inicio",
  endDate: "Fecha de fin",
  currency: "Moneda",
  initialAmount: "Monto del alquiler",
  adjustmentIndex: "Índice de ajuste",
  adjustmentFrequencyMonths: "Frecuencia de ajuste",
};

export interface ContractExtraction {
  tenant: ExtractedPerson | null;
  owner: ExtractedPerson | null;
  property: { address: string | null; city: string | null; description: string | null } | null;
  contractType: ContractType | null;
  startDate: string | null;
  endDate: string | null;
  durationMonths: number | null;
  currency: PaymentCurrency | null;
  initialAmount: number | null;
  adjustmentIndex: string | null;
  adjustmentFrequencyMonths: number | null;
  hasDeposit: boolean | null;
  depositAmount: number | null;
  depositNote: string | null;
  guarantors: ExtractedPerson[];
  utilities: string[];
  extraFields: ContractExtraField[];
  warnings: string[];
  missingFields: MissingField[];
  source: "TEXT" | "IMAGES";
}

export interface ContractDocumentInfo {
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
}
