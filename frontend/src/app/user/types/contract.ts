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
}

export type ContractCreate = Omit<Contract, "id">;
