export enum ContractIncreaseCurrency {
  USD = "USD",
  ARS = "ARS",
}

export interface ContractIncrease {
  id: number;
  contractId: number;
  date: string;
  currency: ContractIncreaseCurrency;
  amount: number;
}

export type ContractIncreaseCreate = Omit<ContractIncrease, "id">;
