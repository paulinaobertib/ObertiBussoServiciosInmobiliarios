import type { Payment, PaymentCurrency } from "./payment";
import type { IncreaseIndex } from "./increaseIndex";
import { ContractUtilityGet } from "./contractUtility";
import { ContractIncrease } from "./contractIncrease";
import { Commission } from "./commission";

export enum ContractType {
  TEMPORAL = "TEMPORAL",
  VIVIENDA = "VIVIENDA",
  COMERCIAL = "COMERCIAL",
}

export enum ContractStatus {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
}

// DTO base para crear/actualizar
export interface Contract {
  id: number;
  userId: string;
  propertyId: number;
  contractType: ContractType;
  startDate: string; // ISO date
  endDate: string; // ISO date
  contractStatus: ContractStatus;
  currency: PaymentCurrency;
  initialAmount: number;
  adjustmentFrequencyMonths: number;
  // Compatibilidad hacia atrás con UI previa
  increase?: number;
  increaseFrequency?: number;
  lastPaidAmount: number | null;
  lastPaidDate: string | null; // ISO date-time
  note: string | null;
  hasDeposit: boolean;
  depositAmount: number | null;
  depositNote: string | null;
  adjustmentIndexId: number | null;
  guarantorsIds?: number[];
}

export type ContractCreate = Omit<Contract, "id">;

// Respuesta enriquecida (ContractGetDTO)
export interface ContractGet {
  id: number;
  userId: string;
  propertyId: number;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  contractStatus: ContractStatus;
  currency: PaymentCurrency;
  initialAmount: number;
  adjustmentFrequencyMonths: number;
  lastPaidAmount: number | null;
  lastPaidDate: string | null;
  note: string | null;
  hasDeposit: boolean;
  depositAmount: number | null;
  depositNote: string | null;
  adjustmentIndex: IncreaseIndex;
  contractUtilities: ContractUtilityGet[];
  contractIncrease: ContractIncrease[];
  commission: Commission | null;
  payments: Payment[];
  guarantors: Array<{ id: number; name: string; phone: string; email: string }>;
}

// Representación mínima de contrato para listados simples
export interface ContractSimple {
  id: number;
  userId: string;
  propertyId: number;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  contractStatus: ContractStatus;
}
