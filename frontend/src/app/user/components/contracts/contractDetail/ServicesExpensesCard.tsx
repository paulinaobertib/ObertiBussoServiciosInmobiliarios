import { Card, Typography, Box, Chip, Stack, Button, Divider } from "@mui/material";
import { useState } from "react";
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
  increases?: Array<{ id: number; adjustmentDate: string; amount: number }> | null;
};

type Props = {
  currency?: string | null;
  utilities: Utility[];
  utilityNameMap: Record<number, string | undefined>;
  onManage?: () => void; // administrar servicios
  onPay?: (contractUtilityId: number) => void;
  onIncrease?: (contractUtilityId: number) => void;
  onEdit?: (contractUtilityId: number) => void;
  onUnlink?: (contractUtilityId: number) => void;
};

export default function ServicesExpensesCard({
  currency,
  utilities,
  utilityNameMap,
  onManage,
  onPay,
  onIncrease,
  onEdit,
  onUnlink,
}: Props) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const money = (n?: number | null) => fmtMoney(n, currency);
  const today = new Date();

  const currentAmount = (u: Utility) => {
    let base = u.initialAmount ?? 0;
    const incs = (u.increases ?? []).filter(Boolean);
    if (!incs.length) return base;
    const effective = incs
      .filter((i) => {
        const d = new Date(i.adjustmentDate as any);
        return !isNaN(d.getTime()) && d.getTime() <= today.getTime();
      })
      .sort((a, b) => (a.adjustmentDate > b.adjustmentDate ? 1 : a.adjustmentDate < b.adjustmentDate ? -1 : 0));
    if (!effective.length) return base;
    return effective[effective.length - 1].amount ?? base;
  };

  return (
    <Grid size={{ xs: 12 }}>
      <Card elevation={2} sx={{ p: "1.5rem", borderRadius: "0.75rem" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
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
            <ElectricalServicesOutlined />
            Servicios y Expensas
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {onManage && (
            <Button
              variant="outlined"
              size="small"
              onClick={onManage}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
            >
              Agregar servicios
            </Button>
          )}
        </Box>

        {utilities.length === 0 ? (
          <Typography color="text.secondary">Sin utilidades asociadas.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {utilities.map((u, idx) => {
              const resolvedName = u.utility?.name ?? (u.utilityId != null ? utilityNameMap[u.utilityId] : undefined);
              const uid = String(u.id ?? idx);
              const open = !!openMap[uid];
              return (
                <Box key={u.id ?? idx} sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    {(resolvedName || u.utilityId != null) && (
                      <Chip size="small" variant="outlined" label={resolvedName ?? `ID ${u.utilityId}`} />
                    )}
                    <Chip size="small" label={periodicityLabel(u.periodicity)} />
                    <Box sx={{ ml: "auto" }} />
                    {onPay && u.id != null && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onPay(u.id!)}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                      >
                        Pagar servicio
                      </Button>
                    )}
                    {onIncrease && u.id != null && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onIncrease(u.id!)}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                      >
                        Aumentar
                      </Button>
                    )}
                    {onEdit && u.id != null && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onEdit(u.id!)}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                      >
                        Editar
                      </Button>
                    )}
                    {onUnlink && u.id != null && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onUnlink(u.id!)}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                      >
                        Desvincular
                      </Button>
                    )}
                  </Box>

                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    <Typography sx={{ color: "text.secondary" }}>
                      <strong>Monto inicial:</strong> {money(u.initialAmount ?? 0)}
                    </Typography>

                    <Typography sx={{ color: "text.secondary" }}>
                      <strong>Monto actual:</strong> {money(currentAmount(u))}
                    </Typography>

                    <Typography sx={{ color: "text.secondary" }}>
                      <strong>Último pago:</strong> {u.lastPaidAmount != null ? money(u.lastPaidAmount) : "-"}{" "}
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

                    {(u.increases?.length ?? 0) > 0 && (
                      <>
                        {open && (
                          <Box sx={{ mt: 1, p: 1, borderRadius: 1, border: '1px solid', borderColor: 'grey.200', maxHeight: 70, overflowY: 'auto' }}>
                            <Typography sx={{ color: "text.secondary", fontWeight: 600, mb: 0.5 }}>Aumentos</Typography>
                            {(u.increases ?? []).map((inc) => (
                              <Typography key={inc.id} sx={{ color: "text.secondary" }}>
                                {fmtDate(inc.adjustmentDate)}: {money(inc.amount)}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setOpenMap((m) => ({ ...m, [uid]: !m[uid] }))}
                            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                          >
                            {open ? 'Ocultar aumentos' : 'Ver aumentos'}
                          </Button>
                        </Box>
                      </>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        )}
      </Card>
    </Grid>
  );
}
