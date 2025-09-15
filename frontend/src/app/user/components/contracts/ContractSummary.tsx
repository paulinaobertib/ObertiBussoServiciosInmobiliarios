import { Box, Grid, Typography, Chip } from "@mui/material";
import type { ContractCreate } from "../../types/contract";

interface Props {
  data: ContractCreate | null;
  guarantorIds: number[];
  utilityIds: number[];
}

export const ContractSummary = ({ data, guarantorIds, utilityIds }: Props) => {
  if (!data) {
    return (
      <Box p={2}>
        <Typography color="error">El formulario aún no está listo.</Typography>
      </Box>
    );
  }

  const Item = ({ label, value }: { label: string; value: any }) => (
    <Box mb={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{String(value ?? "—")}</Typography>
    </Box>
  );

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Item label="Propiedad" value={data.propertyId} />
          <Item label="Usuario" value={data.userId} />
          <Item label="Tipo" value={data.contractType} />
          <Item label="Estado" value={data.contractStatus} />
          <Item label="Inicio" value={data.startDate} />
          <Item label="Fin" value={data.endDate} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Item label="Moneda" value={data.currency} />
          <Item label="Monto inicial" value={data.initialAmount} />
          <Item label="Frecuencia ajuste (meses)" value={data.adjustmentFrequencyMonths} />
          <Item label="Índice de ajuste" value={data.adjustmentIndexId ?? "Ninguno"} />
          <Item label="Notas" value={data.note ?? "—"} />
          <Item
            label="Depósito"
            value={data.hasDeposit ? `${data.depositAmount} (${data.depositNote ?? "sin notas"})` : "No"}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">
            Garantes
          </Typography>
          <Box mt={0.5}>
            {guarantorIds.length === 0 ? (
              <Typography variant="body1">Ninguno</Typography>
            ) : (
              guarantorIds.map((id) => <Chip key={id} label={`#${id}`} size="small" sx={{ mr: 0.5 }} />)
            )}
          </Box>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">
            Utilities seleccionadas
          </Typography>
          <Box mt={0.5}>
            {utilityIds.length === 0 ? (
              <Typography variant="body1">Ninguna</Typography>
            ) : (
              utilityIds.map((id) => <Chip key={id} label={`#${id}`} size="small" sx={{ mr: 0.5 }} />)
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
