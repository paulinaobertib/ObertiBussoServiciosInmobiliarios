import { Grid } from "@mui/material";
import SavingsIcon from "@mui/icons-material/SavingsOutlined";
import ReceiptIcon from "@mui/icons-material/ReceiptLongOutlined";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import { SummaryCard } from "./SummaryCard";

interface Props {
  activeCount: number;
  totalCount: number;
  inactiveCount: number;
}

export const ContractsStats = ({ activeCount, totalCount, inactiveCount }: Props) => (
  <Grid container spacing={3} mb={4}>
    <Grid size={{ xs: 12, sm: 4 }}>
      <SummaryCard icon={<ReceiptIcon color="primary" />} label="Contratos Totales:" value={totalCount} />
    </Grid>
    <Grid size={{ xs: 12, sm: 4 }}>
      <SummaryCard icon={<SavingsIcon color="success" />} label="Contratos Activos: " value={activeCount} />
    </Grid>
    <Grid size={{ xs: 12, sm: 4 }}>
      <SummaryCard icon={<BlockIcon color="error" />} label="Contratos Inactivos: " value={inactiveCount} />
    </Grid>
  </Grid>
);
