export interface ContractUtilityIncrease {
  id: number;
  contractUtilityId: number;
  adjustmentDate: string; // ISO date-time
  amount: number;
}

export type ContractUtilityIncreaseCreate = Omit<ContractUtilityIncrease, 'id'>;

