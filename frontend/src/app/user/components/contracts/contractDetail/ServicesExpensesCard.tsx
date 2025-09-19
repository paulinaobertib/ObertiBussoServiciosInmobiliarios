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

  const parseDate = (d: string) => {
    const t = new Date(d as any).getTime();
    return isNaN(t) ? 0 : t;
  };

  // monto actual: último aumento efectivo (<= hoy) o el inicial
  const currentAmount = (u: Utility) => {
    const base = u.initialAmount ?? 0;
    const incs = (u.increases ?? []).filter(Boolean);
    if (!incs.length) return base;

    const lastEffective = incs
      .filter((i) => parseDate(i.adjustmentDate) <= today.getTime())
      .sort((a, b) => parseDate(b.adjustmentDate) - parseDate(a.adjustmentDate))[0]; // desc

    return lastEffective ? lastEffective.amount ?? base : base;
  };

  // para mostrar: aumentos ordenados desc (recientes primero)
  const sortedIncreases = (u: Utility) =>
    (u.increases ?? []).filter(Boolean).sort((a, b) => parseDate(b.adjustmentDate) - parseDate(a.adjustmentDate)); // desc

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
            >
              Agregar servicios
            </Button>
          )}
        </Box>

        {utilities.length === 0 ? (
          <Typography sx={{ color: "#000" }}>Sin utilidades asociadas.</Typography>
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
                      >
                        Pagar servicio
                      </Button>
                    )}
                    {onIncrease && u.id != null && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onIncrease(u.id!)}
                      >
                        Aumentar
                      </Button>
                    )}
                    {onEdit && u.id != null && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onEdit(u.id!)}
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
                      >
                        Desvincular
                      </Button>
                    )}
                  </Box>

                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    <Typography sx={{ color: "#000" }}>
                      <strong>Monto inicial:</strong> {money(u.initialAmount ?? 0)}
                    </Typography>

                    <Typography sx={{ color: "#000" }}>
                      <strong>Monto actual:</strong> {money(currentAmount(u))}
                    </Typography>

                    <Typography sx={{ color: "#000" }}>
                      <strong>Último pago:</strong> {u.lastPaidAmount != null ? money(u.lastPaidAmount) : "-"}{" "}
                      {u.lastPaidDate && (
                        <Typography component="span" sx={{ color: "#000" }}>
                          ({fmtDate(u.lastPaidDate)})
                        </Typography>
                      )}
                    </Typography>

                    {u.notes && (
                      <Typography sx={{ color: "#000" }}>
                        <strong>Notas:</strong> {u.notes}
                      </Typography>
                    )}

                    {(u.increases?.length ?? 0) > 0 && (
                      <>
                        {open && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 1,
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "grey.200",
                              overflowX: "auto",
                              whiteSpace: "nowrap",
                              "&::-webkit-scrollbar": { height: 6 },
                              "&::-webkit-scrollbar-thumb": { bgcolor: "grey.400", borderRadius: 3 },
                            }}
                          >
                            <Typography sx={{ color: "#000", fontWeight: 600, mb: 1 }}>
                              Historial de aumentos
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: "center", justifyContent: "flex-start" }} // chips de izq→der
                            >
                              {sortedIncreases(u).map((inc, i, arr) => {
                                const isFirst = i === 0; // el último es el más reciente
                                return (
                                  <Box key={inc.id} sx={{ display: "inline-flex", alignItems: "center" }}>
                                    <Chip
                                      size="small"
                                      variant="outlined"
                                      label={`${fmtDate(inc.adjustmentDate)} • ${money(inc.amount)}`}
                                      sx={(t) => ({
                                        borderRadius: 999,
                                        px: 0.5,
                                        ...(isFirst && {
                                          // sombreado sutil para destacar el más reciente
                                          bgcolor: t.palette.action.selected,
                                          borderColor: t.palette.primary.main,
                                          boxShadow: `0 0 0 0 ${t.palette.primary.main} inset`,
                                          fontWeight: 700,
                                        }),
                                      })}
                                    />
                                    {i < arr.length - 1 && (
                                      <Divider
                                        orientation="vertical"
                                        flexItem
                                        sx={{ mx: 1, borderColor: "grey.300", opacity: 0.6 }}
                                      />
                                    )}
                                  </Box>
                                );
                              })}
                            </Stack>
                          </Box>
                        )}

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setOpenMap((m) => ({ ...m, [uid]: !m[uid] }))}
                          >
                            {open ? "Ocultar aumentos" : "Ver aumentos"}
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
