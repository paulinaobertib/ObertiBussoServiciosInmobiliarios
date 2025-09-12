import { Paper, Typography, Box, Grid, Chip, Stack, Button, Divider } from "@mui/material";
import ReceiptOutlined from "@mui/icons-material/ReceiptOutlined";
import AddIcon from "@mui/icons-material/Add";
import { alpha } from "@mui/material/styles";
import { currencyLabel, fmtDate } from "./utils";

type Commission = {
  currency?: string | null;
  totalAmount?: number | null;
  date?: string | null;
  paymentType?: string | null;
  installments?: number | null;
  status?: "PAGADA" | "PARCIAL" | "PENDIENTE" | string | null;
  note?: string | null;
} | null;

type Props = {
  commission: Commission;
  onAdd?: () => void;
};

export default function CommissionCard({ commission, onAdd }: Props) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Paper
        elevation={1}
        sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", height: "80%", flex: 1 }}
      >
        <Typography sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}>
          <ReceiptOutlined />
          Comisión
        </Typography>

        {!commission ? (
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Typography color="text.secondary">Sin comisión registrada.</Typography>
            <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={onAdd}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  bgcolor: "white",
                  borderColor: "warning.main",
                  color: "warning.main",
                  "&:hover": (t) => ({ bgcolor: alpha(t.palette.warning.main, 0.08), borderColor: t.palette.warning.dark }),
                }}
              >
                Agregar
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography sx={{ mb: .5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                    Moneda
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{currencyLabel(commission.currency)}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography sx={{ mb: .5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                    Monto total
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{commission.totalAmount}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography sx={{ mb: .5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                    Fecha
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{fmtDate(commission.date ?? undefined)}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography sx={{ mb: .5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                    Tipo / Cuotas
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {commission.paymentType ?? "-"} {commission.installments ? `(${commission.installments})` : ""}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={commission.status ?? "PENDIENTE"}
                color={
                  commission.status === "PAGADA"
                    ? "success"
                    : commission.status === "PARCIAL"
                    ? "warning"
                    : "default"
                }
                sx={{ fontWeight: 600 }}
              />
              {commission.note && <Typography color="text.secondary">| {commission.note}</Typography>}
            </Stack>
          </Box>
        )}
      </Paper>
    </Grid>
  );
}
