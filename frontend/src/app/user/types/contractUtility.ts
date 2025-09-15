export enum UtilityPeriodicityPayment {
  UNICO = "UNICO",
  MENSUAL = "MENSUAL",
  BIMENSUAL = "BIMENSUAL",
  TRIMESTRAL = "TRIMESTRAL",
  SEMESTRAL = "SEMESTRAL",
  ANUAL = "ANUAL",
}

export interface ContractUtility {
  id: number;
  periodicity: UtilityPeriodicityPayment;
  initialAmount: number;
  lastPaidAmount: number;
  lastPaidDate: string; // ISO date-time
  notes: string;
  contractId: number;
  utilityId: number;
}

export type ContractUtilityCreate = Omit<ContractUtility, "id">;

// Para GET enriquecido (incluye lista de pagos en backend)
export interface ContractUtilityGet extends ContractUtility {
  // Aumentos asociados al servicio dentro del contrato
  increases?: Array<{
    id: number;
    adjustmentDate: string; // ISO date
    amount: number;
  }>;
}
