export interface IncreaseIndex {
  id: number;
  code: string;
  name: string;
}

export type IncreaseIndexCreate = Omit<IncreaseIndex, "id">;
