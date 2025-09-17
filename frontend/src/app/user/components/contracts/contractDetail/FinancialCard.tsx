import { Card, Typography, Box, Stack, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import { fmtDate, fmtMoney } from "./utils";

type Props = {
  currency?: string | null;
  initialAmount?: number | null;
  lastPaidAmount?: number | null;
  lastPaidDate?: string | null;
  adjustmentFrequencyMonths?: number | null;
  adjustmentIndex?: { code: string; name: string } | null | undefined;
  paymentsSorted: any[];
  increasesSorted: any[];
  onRegisterRentPayment?: () => void;
  onRegisterIncrease?: () => void;
};

export default function FinancialCard({
  currency,
  initialAmount,
  lastPaidAmount,
  lastPaidDate,
  adjustmentFrequencyMonths,
  adjustmentIndex,
  paymentsSorted,
  increasesSorted,
  onRegisterRentPayment,
  onRegisterIncrease,
}: Props) {
  const money = (n?: number | null) => fmtMoney(n, currency);

  return (
    <Grid size={{ xs: 12 }}>
      <Card elevation={2} sx={{ p: "1.5rem", borderRadius: "0.75rem" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "primary.main",
            }}
          >
            <AttachMoneyOutlined />
            Información Financiera
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", gap: 1 }}>
            {onRegisterIncrease && (
              <Button
                variant="outlined"
                size="small"
                onClick={onRegisterIncrease}
              >
                Registrar aumento
              </Button>
            )}
            {onRegisterRentPayment && (
              <Button
                variant="contained"
                size="small"
                onClick={onRegisterRentPayment}
              >
                Registrar pago
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                Monto Inicial
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "success.main" }}>
                {money(initialAmount ?? 0)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                Último Pago (Monto)
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: lastPaidAmount != null ? "success.main" : "text.secondary",
                }}
              >
                {lastPaidAmount != null ? money(lastPaidAmount) : "Sin registros"}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                Último Pago (Fecha)
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>{fmtDate(lastPaidDate ?? undefined)}</Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                Frecuencia de Ajuste
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                {adjustmentFrequencyMonths ?? "-"} meses
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {adjustmentIndex && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
              Índice de Ajuste
            </Typography>
            <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
              {adjustmentIndex.code} - {adjustmentIndex.name}
            </Typography>
          </Box>
        )}

        {/* Historiales */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* Pagos */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              variant="outlined"
              sx={{ p: "1rem", borderRadius: "0.5rem", height: "10.625rem", display: "flex", flexDirection: "column" }}
            >
              <Typography sx={{ mb: 1, fontSize: "1.25rem", fontWeight: 600, color: "warning.main" }}>
                Historial de Pagos
              </Typography>
              <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                {paymentsSorted.length === 0 ? (
                  <Typography color="text.secondary">Sin pagos registrados.</Typography>
                ) : (
                  <Stack spacing={0.5}>
                    {paymentsSorted.map((p: any, idx: number) => {
                      const payDate = p.date ?? p.paymentDate;
                      const payAmount = p.amount ?? 0;
                      const payType: string =
                        p.concept ??
                        p.type ??
                        p.paymentType ??
                        (p.contractUtilityId ? "SERVICIO / EXPENSA" : "ALQUILER");

                      return (
                        <Box
                          key={p.id ?? idx}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            py: 0.5,
                            borderBottom: "1px solid",
                            borderColor: "grey.100",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ width: 110, flexShrink: 0 }}>
                            {fmtDate(payDate)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{
                              flex: 1,
                              textAlign: "center",
                              textTransform: "uppercase",
                              letterSpacing: 0.25,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {String(payType).replace(/_/g, " ")}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ width: 120, flexShrink: 0, textAlign: "right" }}
                          >
                            {money(payAmount)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Aumentos */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              variant="outlined"
              sx={{ p: "1rem", borderRadius: "0.5rem", height: "10.625rem", display: "flex", flexDirection: "column" }}
            >
              <Typography sx={{ mb: 1, fontSize: "1.25rem", fontWeight: 600, color: "warning.main" }}>
                Historial de Aumentos
              </Typography>
              <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                {increasesSorted.length === 0 ? (
                  <Typography color="text.secondary">Sin aumentos registrados.</Typography>
                ) : (
                  <Stack spacing={0.5}>
                    {increasesSorted.map((a: any, idx: number) => {
                      const prefix = (c?: string | null) => (c === "USD" ? "USD $ " : "ARS $ ");
                      const adjStr =
                        typeof a.adjustment === "number"
                          ? a.adjustment < 1
                            ? `+${Math.round(a.adjustment * 100)}%`
                            : `+ ${prefix(a.currency)}${a.adjustment.toLocaleString("es-AR")}`
                          : "";

                      return (
                        <Box
                          key={a.id ?? idx}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 0.5,
                            borderBottom: "1px solid",
                            borderColor: "grey.100",
                          }}
                        >
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {fmtDate(a.date)}
                            </Typography>
                            {adjStr && (
                              <Typography variant="caption" color="text.disabled">
                                {adjStr}
                                {a.note ? ` · ${a.note}` : ""}
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="body2" fontWeight={700}>
                            {a.amount != null
                              ? `${prefix(a.currency)}${Number(a.amount).toLocaleString("es-AR")}`
                              : "-"}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
}
