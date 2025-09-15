import { Card, Typography, Box } from "@mui/material";
import PaidIcon from "@mui/icons-material/Paid";
import { fmtMoney } from "./utils";

type Props = {
  currency?: string | null;
  hasDeposit?: boolean | null;
  depositAmount?: number | null;
  depositNote?: string | null;
  sxHeight?: string | number;
};

export default function DepositCard({ currency, hasDeposit, depositAmount, depositNote, sxHeight }: Props) {
  // Tenant (sin sxHeight) => mostramos nota al lado del monto si existe
  const inline = !sxHeight && !!depositNote;

  return (
    <Box sx={{ flex: "1 1 0", minWidth: 0, display: "flex" }}>
      <Card
        elevation={2}
        sx={{
          p: "1.5rem",
          borderRadius: "0.75rem",
          display: "flex",
          flexDirection: "column",
          width: 1, 
          flex: 1,
        }}
      >
        <Typography
          sx={{
            mb: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
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
              gap: "1rem",
              alignItems: inline ? "flex-start" : "stretch",
              flexWrap: "wrap",
            }}
          >
            {/* Bloque Monto */}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ mb: ".5rem", fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                Monto del Depósito
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "warning.main" }}>
                {fmtMoney(depositAmount ?? 0, currency)}
              </Typography>
            </Box>

            {/* Bloque Nota (en línea al lado del monto en tenant) */}
            {depositNote && (
              <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ mb: ".5rem", fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
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
                >
                  {depositNote}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary">No hay depósitos registrados.</Typography>
        )}
      </Card>
    </Box>
  );
}
