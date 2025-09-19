import { useState } from "react";
import { Card, Typography, Box, Stack, Button, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
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
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({});

  const toggleDescription = (id: string) => {
    setExpandedPayments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
              <Button variant="outlined" size="small" onClick={onRegisterIncrease}>
                Registrar aumento
              </Button>
            )}
            {onRegisterRentPayment && (
              <Button variant="contained" size="small" onClick={onRegisterRentPayment}>
                Registrar pago
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "#000", fontWeight: 500 }}>
                Monto Inicial
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "success.main" }}>
                {money(initialAmount ?? 0)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "#000", fontWeight: 500 }}>
                Último Pago (Monto)
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: lastPaidAmount != null ? "success.main" : "#000",
                }}
              >
                {lastPaidAmount != null ? money(lastPaidAmount) : "Sin registros"}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "#000", fontWeight: 500 }}>
                Último Pago (Fecha)
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>{fmtDate(lastPaidDate ?? undefined)}</Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "#000", fontWeight: 500 }}>
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
            <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "#000", fontWeight: 500 }}>
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
            <Box
              sx={{
                border: "1px solid",
                borderColor: "grey.300",
                p: "1rem",
                borderRadius: "0.5rem",
                height: "10.5rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography sx={{ mb: 1, fontSize: "1.25rem", fontWeight: 600, color: "warning.main" }}>
                Historial de Pagos
              </Typography>
              <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                {paymentsSorted.length === 0 ? (
                  <Typography sx={{ color: "#000" }}>Sin pagos registrados.</Typography>
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
                      const description = (p.description ?? "").trim();
                      const identifier = String(p.id ?? `idx-${idx}`);
                      const isExpanded = Boolean(expandedPayments[identifier]);
                      const hasDescription = description.length > 0;

                      return (
                        <Box
                          key={p.id ?? idx}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            borderBottom: "1px solid",
                            borderColor: "grey.100",
                            py: 0.5,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {hasDescription ? (
                              <IconButton
                                size="small"
                                onClick={() => toggleDescription(identifier)}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  border: "1px solid",
                                  borderColor: isExpanded ? "primary.main" : "grey.300",
                                }}
                              >
                                <InfoOutlined fontSize="inherit" color={isExpanded ? "primary" : "action"} />
                              </IconButton>
                            ) : (
                              <Box sx={{ width: 28, height: 28 }} />
                            )}
                            <Typography variant="body2" sx={{ width: 110, flexShrink: 0, color: "#000" }}>
                              {fmtDate(payDate)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.primary"
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
                          {hasDescription && isExpanded && (
                            <Typography variant="caption" sx={{ mt: 0.5, pl: 5.5, color: "#000" }}>
                              {description}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Aumentos */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "grey.300",
                p: "1rem",
                borderRadius: "0.5rem",
                height: "10.5rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography sx={{ mb: 1, fontSize: "1.25rem", fontWeight: 600, color: "warning.main" }}>
                Historial de Aumentos
              </Typography>
              <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                {increasesSorted.length === 0 ? (
                  <Typography sx={{ color: "#000" }}>Sin aumentos registrados.</Typography>
                ) : (
                  <Stack spacing={0.5}>
                    {increasesSorted.map((a: any) => {
                      const prefix = (c?: string | null) => (c === "USD" ? "USD $ " : "ARS $ ");
                      const percentStr = (() => {
                        if (a.adjustment == null) return "";
                        const raw = Number(a.adjustment);
                        if (Number.isNaN(raw)) return "";
                        const rounded = Math.round(raw * 10) / 10;
                        const display = Math.abs(rounded % 1) < 0.05 ? rounded.toFixed(0) : rounded.toFixed(1);
                        const sign = raw >= 0 ? "+" : "";
                        return `${sign}${display}%`;
                      })();

                      const metadata = [percentStr, a.note?.trim()].filter(Boolean).join(" · ");

                      return (
                        <Box
                          key={a.id}
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
                            <Typography variant="body2" sx={{ color: "#000" }}>
                              {fmtDate(a.date)}
                            </Typography>
                            {metadata && (
                              <Typography variant="caption" sx={{ color: "#000" }}>
                                {metadata}
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
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
}
