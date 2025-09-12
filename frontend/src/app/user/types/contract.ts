import { ContractIncrease } from "./contractIncrease";

export enum ContractType {
  TEMPORAL = "TEMPORAL",
  VIVIENDA = "VIVIENDA",
  COMERCIAL = "COMERCIAL",
}

export enum ContractStatus {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
}

export interface Contract {
  id: number;
  userId: string;
  propertyId: number;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  contractStatus: ContractStatus;
  increase: number;
  increaseFrequency: number;
  lastPaidAmount?: number | null; 
  lastPaidDate?: string | null; // es fecha y hora "2025-02-01T00:00:00"
  contractIncrease?: ContractIncrease[];
}

export type ContractCreate = Omit<Contract, "id">;

export type Currency = "USD" | "ARS";

export interface AdjustmentIndexRef {
  id: number;
  code: string;
  name: string;
}

export type ContractDetail = Contract & {
  currency?: Currency;
  initialAmount?: number | null;
  adjustmentFrequencyMonths?: number | null;
  adjustmentIndex?: AdjustmentIndexRef | null;

  hasDeposit?: boolean;
  depositAmount?: number | null;
  depositNote?: string | null;

  guarantors?: any[] | null;
  contractUtilities?: any[] | null;
  payments?: any[] | null;

  note?: string | null;
};
