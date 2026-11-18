export type RentIndex = "IPC" | "ICL";

export interface RentPeriod {
  number: number;
  date: string; // YYYY-MM-DD
  fromLabel: string;
  toLabel: string;
  fromValue: number | null;
  toValue: number | null;
  variationPercent: number | null;
  amount: number | null;
  accumulatedPercent: number | null;
  pending: boolean;
  pendingReason: string | null;
  months: { label: string; percent: number }[];
}

export interface RentCalculation {
  index: RentIndex;
  ipcLag: number | null;
  initialAmount: number;
  startDate: string;
  months: number;
  currentAmount: number;
  accumulatedPercent: number;
  periods: RentPeriod[];
  dataUpdatedTo: string;
  source: string;
}

export interface RentCalculatorInput {
  amount: number;
  startDate: string;
  months: number;
  index: RentIndex;
  ipcLag?: number;
}
