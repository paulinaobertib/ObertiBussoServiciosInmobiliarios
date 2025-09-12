export enum ContractIncreaseCurrency {
  USD = "USD",
  ARS = "ARS",
}

export interface ContractIncrease {
  id: number;
  contractId: number;
  date: string; // ISO date-time
  currency: ContractIncreaseCurrency;
  amount: number;
  adjustment?: number;
  note?: string;
  periodFrom?: string; // ISO date-time
  periodTo?: string; // ISO date-time
  indexId?: number;
}

export type ContractIncreaseCreate = Omit<ContractIncrease, "id">;
