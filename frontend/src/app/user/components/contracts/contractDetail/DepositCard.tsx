import { Paper, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import PaidIcon from "@mui/icons-material/Paid";
import { fmtMoney } from "./utils";

type Props = {
  currency?: string | null;
  hasDeposit?: boolean | null;
  depositAmount?: number | null;
  depositNote?: string | null;
  /** si lo pasás (p.ej. "80%") usamos layout en columna (admin);
   * si no lo pasás, layout en fila (tenant) */
  sxHeight?: string | number;
};

export default function DepositCard({
  currency,
  hasDeposit,
  depositAmount,
  depositNote,
  sxHeight,
}: Props) {
  // Tenant (sin sxHeight) => mostramos nota al lado del monto si existe
  const inline = !sxHeight && !!depositNote;

  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
          height: sxHeight ?? "71%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          <PaidIcon />
          Depósito
        </Typography>

        {hasDeposit ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: inline ? "row" : "column",
              gap: inline ? 6 : 2,
              alignItems: inline ? "flex-start" : "stretch",
              flexWrap: "wrap",
            }}
          >
            {/* Bloque Monto */}
            <Box sx={{ minWidth: 220 }}>
              <Typography
                sx={{ mb: 0.5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}
              >
                Monto del Depósito
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "warning.main" }}>
                {fmtMoney(depositAmount ?? 0, currency)}
              </Typography>
            </Box>

            {/* Bloque Nota (en línea al lado del monto en tenant) */}
            {depositNote && (
              <Box sx={{ minWidth: 220 }}>
                <Typography
                  sx={{ mb: 0.5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}
                >
                  Nota del Depósito
                </Typography>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    // por si el texto es muy largo:
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                  title={depositNote}
                >
                  {depositNote}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary">No hay depósitos registrados.</Typography>
        )}
      </Paper>
    </Grid>
  );
}
