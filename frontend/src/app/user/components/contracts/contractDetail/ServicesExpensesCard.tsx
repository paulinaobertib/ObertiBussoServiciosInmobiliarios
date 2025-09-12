import { Paper, Typography, Box, Chip, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import ElectricalServicesOutlined from "@mui/icons-material/ElectricalServicesOutlined";
import { fmtDate, fmtMoney, periodicityLabel } from "./utils";

type Utility = {
  id?: number;
  utilityId?: number | null;
  utility?: { name?: string | null } | null;
  periodicity?: string | null;
  initialAmount?: number | null;
  lastPaidAmount?: number | null;
  lastPaidDate?: string | null;
  notes?: string | null;
};

type Props = {
  currency?: string | null;
  utilities: Utility[];
  utilityNameMap: Record<number, string | undefined>;
};

export default function ServicesExpensesCard({ currency, utilities, utilityNameMap }: Props) {
  const money = (n?: number | null) => fmtMoney(n, currency);

  return (
    <Grid size={{ xs: 12 }}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
        <Typography sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}>
          <ElectricalServicesOutlined />
          Servicios y Expensas
        </Typography>

        {utilities.length === 0 ? (
          <Typography color="text.secondary">Sin utilidades asociadas.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {utilities.map((u, idx) => {
              const resolvedName = u.utility?.name ?? (u.utilityId != null ? utilityNameMap[u.utilityId] : undefined);
              return (
                <Box key={u.id ?? idx} sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    {(resolvedName || u.utilityId != null) && (
                      <Chip size="small" variant="outlined" label={resolvedName ?? `ID ${u.utilityId}`} />
                    )}
                    <Chip size="small" label={periodicityLabel(u.periodicity)} />
                  </Box>

                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    <Typography sx={{ color: "text.secondary" }}>
                      <strong>Monto inicial:</strong> {money(u.initialAmount ?? 0)}
                    </Typography>

                    <Typography sx={{ color: "text.secondary" }}>
                      <strong>Último pago:</strong>{" "}
                      {u.lastPaidAmount != null ? money(u.lastPaidAmount) : "-"}{" "}
                      {u.lastPaidDate && (
                        <Typography component="span" color="text.disabled">
                          ({fmtDate(u.lastPaidDate)})
                        </Typography>
                      )}
                    </Typography>

                    {u.notes && (
                      <Typography sx={{ color: "text.secondary" }}>
                        <strong>Notas:</strong> {u.notes}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Grid>
  );
}
