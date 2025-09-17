import { Card, Typography, Box, Chip, Stack, Button, Divider, List, ListItem, ListItemText, Grid } from "@mui/material";
import ReceiptOutlined from "@mui/icons-material/ReceiptOutlined";
import { currencyLabel, fmtDate } from "./utils";

type Commission = {
  id?: string | number | null;
  currency?: string | null;
  totalAmount?: number | null;
  date?: string | null;
  paymentType?: "COMPLETO" | "CUOTAS" | string | null;
  installments?: number | null;
  status?: "PAGADA" | "PARCIAL" | "PENDIENTE" | string | null;
  note?: string | null;
} | null;

type Props = {
  commission: Commission;
  paidCount?: number; // cuotas ya pagadas
  onAdd?: () => void;
  onEdit?: () => void;
  onRegisterPayment?: () => void;
  onRegisterInstallment?: (n: number) => void;
  gridFull?: boolean;
};

function statusColor(s?: string | null) {
  if (!s) return "default" as const;
  if (s === "PAGADA") return "success" as const;
  if (s === "PARCIAL") return "info" as const;
  if (s === "PENDIENTE") return "warning" as const;
  return "default" as const;
}

function prettyPaymentType(pt?: string | null) {
  if (pt === "COMPLETO") return "COMPLETO";
  if (pt === "CUOTAS") return "CUOTAS";
  return pt || "-";
}

export default function CommissionCard({ commission, paidCount = 0, onAdd, onEdit, onRegisterInstallment, gridFull = false }: Props) {
  const hasCommission = !!commission;
  // Derivar estado mostrado según pagos para evitar inconsistencias
  const derivedStatus = (() => {
    if (!commission) return "PENDIENTE" as const;
    if (commission.paymentType === "CUOTAS") {
      const total = commission.installments || 1;
      if (paidCount <= 0) return "PENDIENTE" as const;
      if (paidCount < total) return "PARCIAL" as const;
      return "PAGADA" as const;
    }
    return paidCount >= 1 ? "PAGADA" : (commission.status as any) || "PENDIENTE";
  })();
  const isPaid = derivedStatus === "PAGADA";
  const primaryHandler = hasCommission ? onEdit : onAdd;

  const installmentsCount =
    commission?.paymentType === "CUOTAS" && commission?.installments && commission.installments > 1
      ? commission.installments
      : 0;
  const nextToPay = Math.max(1, Math.min(installmentsCount || 1, paidCount + 1));

  return (
    <Grid size={{ xs: 12, sm: gridFull ? 12 : 6 }}>
      <Card elevation={2} sx={{ p: "1.5rem", borderRadius: "0.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}>
            <ReceiptOutlined />
            Comisión
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {primaryHandler && (
            <Button
              variant="outlined"
              size="small"
              onClick={primaryHandler}
            >
              {hasCommission ? "Editar comisión" : "Agregar comisión"}
            </Button>
          )}
        </Box>

        {/* Contenido */}
        {!hasCommission ? (
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Typography sx={{ color: "#000" }}>Sin comisión registrada.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "#000", fontWeight: 500 }}>
                    Moneda
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#000" }}>{currencyLabel(commission.currency)}</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "#000", fontWeight: 500 }}>
                    Monto total
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#000" }}>{commission.totalAmount ?? "-"}</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "#000", fontWeight: 500 }}>
                    Fecha
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#000" }}>{fmtDate(commission.date ?? undefined)}</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "#000", fontWeight: 500 }}>
                    Tipo / Cuotas
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#000" }}>
                    {prettyPaymentType(commission.paymentType)}{" "}
                    {commission.paymentType === "CUOTAS"
                      ? commission.installments
                        ? `- ${commission.installments}`
                        : ""
                      : ""}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider />

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={derivedStatus} color={statusColor(derivedStatus)} sx={{ fontWeight: 600 }} />
              {!!commission.note && (
                <Typography noWrap sx={{ maxWidth: 320, color: "#000" }}>
                  | {commission.note}
                </Typography>
              )}
            </Stack>

            {/* Cuotas */}
            {installmentsCount > 0 && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, mr: 1, color: "#000" }}>Cuotas</Typography>
                </Box>

                <Box sx={{ maxHeight: "6.5rem", overflowY: "auto", pr: 1 }}>
                  <List dense disablePadding>
                    {Array.from({ length: installmentsCount }).map((_, idx) => {
                      const n = idx + 1;
                      const isAlreadyPaid = n <= paidCount || isPaid;
                      const isNext = n === nextToPay && !isAlreadyPaid;
                      return (
                        <ListItem
                          key={n}
                          disableGutters
                          secondaryAction={
                            isAlreadyPaid ? (
                              <Chip size="small" color="success" label="Pagada" sx={{ fontWeight: 700 }} />
                            ) : isNext && onRegisterInstallment ? (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onRegisterInstallment(n)}
                              >
                                Registrar Pago #{n}
                              </Button>
                            ) : (
                              <Chip size="small" color="default" label="Pendiente" sx={{ fontWeight: 700 }} />
                            )
                          }
                          sx={{ borderRadius: 1, px: 1 }}
                        >
                          <ListItemText primary={`Cuota #${n}`} />
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Card>
    </Grid>
  );
}
