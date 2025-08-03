import { Grid } from "@mui/material";
import { ContractItem } from "./ContractItem";
import type { Contract } from "../../types/contract";

interface Props {
  contracts: Contract[];
  onRegisterPayment: (c: Contract) => void;
  onIncrease: (c: Contract) => void;
  onHistory: (c: Contract) => void;
  onDelete: (c: Contract) => void;
  onToggleStatus: (c: Contract) => void;
}

export const ContractList = ({ contracts, onRegisterPayment, onIncrease, onHistory, onDelete, onToggleStatus }: Props) => (
  <Grid container spacing={4}>
    {contracts.map((c) => (
      <Grid size={{ xs: 12, sm: 6 }} key={c.id}>
        <ContractItem
          contract={c}
          onRegisterPayment={onRegisterPayment}
          onIncrease={onIncrease}
          onHistory={onHistory}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      </Grid>
    ))}
  </Grid>
);
