import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { PaymentForm, PaymentFormValues } from "./PaymentForm";
import { postPayment } from "../../services/payment.service";
import type { Contract } from "../../types/contract";
import type { PaymentCreate, Payment } from "../../types/payment";
import { PaymentCurrency, PaymentConcept } from "../../types/payment";
import { patchCommissionStatus } from "../../services/commission.service";
import type { Commission } from "../../types/commission";
import { CommissionStatus, CommissionPaymentType } from "../../types/commission";
import { getContractUtilitiesByContract } from "../../services/contractUtility.service";
import { getUtilityById } from "../../services/utility.service";
import type { ContractUtilityGet } from "../../types/contractUtility";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import dayjs from "dayjs";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

interface Props {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
  onSaved: () => void;
  presetConcept?: PaymentConcept;
  presetUtilityId?: number;
  presetInstallment?: number | null;
  fixedConcept?: PaymentConcept;
}

export const PaymentDialog = ({
  open,
  contract,
  onClose,
  onSaved,
  presetConcept,
  presetUtilityId,
  presetInstallment,
  fixedConcept,
}: Props) => {
  const { showAlert } = useGlobalAlert();

  const empty: PaymentFormValues = {
    date: "",
    amount: "",
    description: "",
    paymentCurrency: "",
    concept: "",
    contractUtilityId: "",
    commissionId: "",
  };
  const [vals, setVals] = useState<PaymentFormValues>(empty);
  const [saving, setSaving] = useState(false);
  const [commission, setCommission] = useState<Commission | null>(null);
  const [commissionPaidCount, setCommissionPaidCount] = useState<number>(0);
  // const [assignOpen, setAssignOpen] = useState(false);
  const [concept, setConcept] = useState<PaymentConcept | "">("");
  const [selectedUtilityId, setSelectedUtilityId] = useState<number | "">("");
  type UtilityRow = {
    id: number;
    utilityId: number;
    name: string;
    periodicity: any;
    lastPaidDate?: string | null;
    lastPaidAmount?: number | null;
  };
  const [utilities, setUtilities] = useState<UtilityRow[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setVals(empty);
    setCommission(null);
    setCommissionPaidCount(0);
    setConcept("");
    setSelectedUtilityId("");
    setUtilities([]);
    setSelectedInstallment(null);
    setExpandedDescriptions({});
  }, [contract]);

  useEffect(() => {
    if (!open) return;
    if (fixedConcept) setConcept(fixedConcept);
    else if (presetConcept) setConcept(presetConcept);
    if (presetUtilityId) setSelectedUtilityId(presetUtilityId);
    if (presetInstallment != null) setSelectedInstallment(presetInstallment);
  }, [open, presetConcept, presetUtilityId, fixedConcept, presetInstallment]);

  useEffect(() => {
    if (!open || !contract) return;
    // Usar siempre los datos del contrato para evitar 500 del backend en /commissions/contract/{id}
    const c = (contract as any)?.commission as Commission | null;
    setCommission(c ?? null);
    if (c?.id) {
      const count = Array.isArray((contract as any)?.payments)
        ? (contract as any).payments.filter(
            (p: any) => p?.concept === 'COMISION' && Number(p?.commissionId) === Number(c.id)
          ).length
        : 0;
      setCommissionPaidCount(count);
      const next = c.paymentType === CommissionPaymentType.CUOTAS
        ? Math.min((c.installments || 1), count + 1)
        : 1;
      const desired = presetInstallment ?? next;
      setSelectedInstallment(Math.min(desired, next));
    } else {
      setCommissionPaidCount(0);
      setSelectedInstallment(null);
    }
  }, [open, contract, presetInstallment]);

  useEffect(() => {
    if (!open) return;
    setExpandedDescriptions({});
  }, [open]);

  // Prefijar importe y moneda cuando sea comisión (monto por cuota o único)
  useEffect(() => {
    if (!open) return;
    if (concept !== PaymentConcept.COMISION) return;
    if (!commission) return;
    const installmentsRaw = commission.paymentType === CommissionPaymentType.CUOTAS ? Number(commission.installments) || 1 : 1;
    const installments = Math.max(1, installmentsRaw);
    const totalAmount = Number(commission.totalAmount ?? 0);
    const perInstallment = installments > 0 ? totalAmount / installments : totalAmount;
    if (!Number.isFinite(perInstallment)) return;
    const normalized = Number(perInstallment.toFixed(2));
    setVals((prev) => ({
      ...prev,
      paymentCurrency: (commission.currency as unknown as PaymentCurrency),
      amount: normalized,
    }));
  }, [open, concept, commission, selectedInstallment]);

  const commissionPayments = useMemo(() => {
    if (!commission?.id) return [] as Payment[];
    const list = Array.isArray((contract as any)?.payments)
      ? (contract as any).payments.filter(
          (p: any) => p?.concept === 'COMISION' && Number(p?.commissionId) === Number(commission.id)
        )
      : [];
    return [...list].sort((a: any, b: any) => dayjs(a.date ?? a.paymentDate).valueOf() - dayjs(b.date ?? b.paymentDate).valueOf());
  }, [contract, commission]);

  useEffect(() => {
    const loadUtilities = async () => {
      if (!open || !contract) return;
      try {
        const list = await getContractUtilitiesByContract(contract.id);
        const withNames: UtilityRow[] = [];
        for (const cu of list as ContractUtilityGet[]) {
          try {
            const util = await getUtilityById(cu.utilityId);
            withNames.push({
              id: cu.id,
              utilityId: cu.utilityId,
              name: (util as any).name,
              periodicity: (cu as any).periodicity,
              lastPaidDate: (cu as any).lastPaidDate,
              lastPaidAmount: (cu as any).lastPaidAmount,
            });
          } catch {
            withNames.push({
              id: cu.id,
              utilityId: cu.utilityId,
              name: `Servicio`,
              periodicity: (cu as any).periodicity,
              lastPaidDate: (cu as any).lastPaidDate,
              lastPaidAmount: (cu as any).lastPaidAmount,
            });
          }
        }
        setUtilities(withNames);
      } catch {
        setUtilities([]);
      }
    };
    loadUtilities();
  }, [open, contract]);

  useEffect(() => {
    if (concept !== PaymentConcept.EXTRA) setSelectedUtilityId("");
    if (concept !== PaymentConcept.COMISION) setSelectedInstallment(null);
  }, [concept]);

  const isValid = (() => {
    const base = vals.date && vals.amount !== "" && Number(vals.amount) > 0 && vals.paymentCurrency && concept;
    if (!base) return false;
    if (concept === PaymentConcept.EXTRA) return Boolean(selectedUtilityId);
    if (concept === PaymentConcept.COMISION) {
      if (!commission) return false;
      // No bloquear por status: definimos la secuencia por cantidad de pagos
      return Boolean(commission.id) && selectedInstallment != null;
    }
    return true;
  })();

  const handleSave = async () => {
    if (!contract) return;
    if (!isValid) return;
    setSaving(true);

    const payload: PaymentCreate = {
      paymentCurrency: vals.paymentCurrency as PaymentCurrency,
      amount: Number(vals.amount),
      date: `${vals.date}T00:00:00`,
      description: vals.description,
      concept: concept as PaymentConcept,
      contractId: contract.id,
      contractUtilityId: concept === PaymentConcept.EXTRA ? Number(selectedUtilityId) : undefined,
      commissionId: concept === PaymentConcept.COMISION ? Number(commission?.id) : undefined,
    };

    try {
      await postPayment(payload);
      // Si es comisión, actualizar estado según cantidad de pagos
      if (concept === PaymentConcept.COMISION && commission?.id) {
        const nextCount = commissionPaidCount + 1;
        let newStatus: CommissionStatus | null = null;
        if (commission.paymentType === CommissionPaymentType.COMPLETO) {
          newStatus = CommissionStatus.PAGADA;
        } else if ((commission.installments ?? 0) > 0) {
          newStatus = nextCount >= (commission.installments as number)
            ? CommissionStatus.PAGADA
            : CommissionStatus.PARCIAL;
        } else {
          // Cuotas inválidas/no seteadas: no marcar PAGADA prematuramente
          newStatus = CommissionStatus.PARCIAL;
        }
        try {
          await patchCommissionStatus(commission.id, newStatus);
        } catch (e) {
          console.warn("No se pudo actualizar el estado de la comisión", e);
        }
      }
      showAlert("Pago creado con éxito", "success");
      onSaved();
      onClose();
    } catch (e) {
      console.error("Error creating payment:", e);
      showAlert("Error al crear el pago", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Registrar Pago" onClose={onClose}>
      {/* Concept buttons */}
      {!fixedConcept && (
        <Box display="flex" justifyContent="center" my={1}>
          <ButtonGroup variant="outlined" color="primary">
            <Button
              variant={concept === PaymentConcept.ALQUILER ? "contained" : "outlined"}
              onClick={() => setConcept(PaymentConcept.ALQUILER)}
            >
              Alquiler
            </Button>
            <Button
              variant={concept === PaymentConcept.EXTRA ? "contained" : "outlined"}
              onClick={() => setConcept(PaymentConcept.EXTRA)}
            >
              Extra
            </Button>
            <Button
              variant={concept === PaymentConcept.COMISION ? "contained" : "outlined"}
              onClick={() => setConcept(PaymentConcept.COMISION)}
            >
              Comisión
            </Button>
          </ButtonGroup>
        </Box>
      )}

      {/* Concept-specific content */}
      {concept === PaymentConcept.EXTRA && (
        <Box my={1}>
          <Typography variant="subtitle2">
            Servicios del contrato:
          </Typography>
          <List dense>
            {utilities.map((u) => {
              const monthsFor: Record<string, number> = {
                UNICO: 0,
                MENSUAL: 1,
                BIMENSUAL: 2,
                TRIMESTRAL: 3,
                SEMESTRAL: 6,
                ANUAL: 12,
              };
              const labelize = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : "");
              const per = String(u.periodicity);
              const months = monthsFor[per] ?? 0;
              const last = u.lastPaidDate ? dayjs(u.lastPaidDate) : null;
              const nextDue = last && months > 0 ? last.add(months, "month") : null;
              const secondary = [
                `Periodicidad: ${labelize(per)}`,
                `Último: ${
                  last
                    ? last.format("DD/MM/YYYY") +
                      (u.lastPaidAmount
                        ? ` - $${(u.lastPaidAmount as any).toLocaleString?.() ?? u.lastPaidAmount}`
                        : "")
                    : "—"
                }`,
                per !== "UNICO" && nextDue ? `Próximo: ${nextDue.format("DD/MM/YYYY")}` : undefined,
                per === "UNICO" && last ? "Pagada" : undefined,
              ]
                .filter(Boolean)
                .join(" • ");

              return (
                <ListItem key={u.id} disablePadding>
                  <ListItemButton selected={selectedUtilityId === u.id} onClick={() => setSelectedUtilityId(u.id)}>
                    <ListItemText primary={u.name} secondary={secondary} />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {!utilities.length && (
              <Typography variant="body2" color="text.secondary">
                No hay servicios vinculados al contrato.
              </Typography>
            )}
          </List>
          <Divider sx={{ my: 1 }} />
        </Box>
      )}

      {concept === PaymentConcept.COMISION && (
        <Box my={1}>
          {!commission && (
            <Box display="flex" alignItems="center" gap={1}>
              <span>No hay comisión asignada.</span>
            </Box>
          )}
          {commission && (
            <>
              {commission.paymentType === CommissionPaymentType.CUOTAS ? (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Cuotas
                  </Typography>
                  <List dense sx={{ '& .MuiListItemButton-root': { borderRadius: 1 } }}>
                    {Array.from({ length: commission.installments }, (_, i) => i + 1).map((n) => {
                      const paid = n <= commissionPaidCount;
                      const next = Math.min(Math.max(commission.installments || 1, 1), commissionPaidCount + 1);
                      const disabled = paid || n !== next;
                      const payment = commissionPayments[n - 1];
                      const paymentDateLabel = payment ? dayjs(payment.date ?? payment.paymentDate).format('DD/MM/YYYY') : null;
                      const description = (payment?.description ?? '').trim();
                      const hasDescription = description.length > 0;
                      const openDescription = !!expandedDescriptions[n];
                      const toggleDescription = () => {
                        if (!hasDescription) return;
                        setExpandedDescriptions((prev) => ({ ...prev, [n]: !prev[n] }));
                      };
                      const statusLabel = paid ? 'Pagada' : 'Pendiente';
                      const statusColor = paid ? 'success' : 'default';
                      const handleSelect = () => {
                        if (disabled) return;
                        setSelectedInstallment(n);
                      };
                      return (
                        <ListItem
                          key={n}
                          disablePadding
                          sx={{ alignItems: 'stretch' }}
                          secondaryAction={
                            <Stack spacing={0.25} alignItems="flex-end">
                              <Chip size="small" color={statusColor} label={statusLabel} sx={{ fontWeight: 600 }} />
                              {paymentDateLabel && (
                                <Typography variant="caption" color="text.secondary">
                                  {paymentDateLabel}
                                </Typography>
                              )}
                            </Stack>
                          }
                        >
                          <ListItemButton
                            selected={selectedInstallment === n}
                            onClick={handleSelect}
                            sx={{
                              minHeight: 32,
                              py: 0.5,
                              pr: 7,
                              pl: 1,
                              opacity: disabled ? 0.55 : 1,
                              cursor: disabled ? 'default' : 'pointer',
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {hasDescription ? (
                                    <IconButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDescription();
                                      }}
                                      size="small"
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        border: '1px solid',
                                        borderColor: openDescription ? 'primary.main' : 'grey.300',
                                      }}
                                    >
                                      <InfoOutlined fontSize="inherit" color={openDescription ? 'primary' : 'action'} />
                                    </IconButton>
                                  ) : (
                                    <Box sx={{ width: 24, height: 24 }} />
                                  )}
                                  <Typography component="span" sx={{ fontSize: '.85rem', fontWeight: 600, color: '#000' }}>
                                    {`Cuota #${n}`}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItemButton>
                          {hasDescription && openDescription && (
                            <Typography sx={{ fontSize: '.75rem', color: 'text.secondary', px: 1, pb: 0.5 }}>
                              {description}
                            </Typography>
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                </>
              ) : (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Comisión
                  </Typography>
                  <List dense sx={{ '& .MuiListItemButton-root': { borderRadius: 1 } }}>
                    {(() => {
                      const paid = commissionPaidCount > 0;
                      const payment = commissionPayments[0];
                      const paymentDateLabel = payment ? dayjs(payment.date ?? payment.paymentDate).format('DD/MM/YYYY') : null;
                      const description = (payment?.description ?? '').trim();
                      const hasDescription = description.length > 0;
                      const openDescription = !!expandedDescriptions[1];
                      const toggleDescription = () => {
                        if (!hasDescription) return;
                        setExpandedDescriptions((prev) => ({ ...prev, 1: !prev[1] }));
                      };
                      const handleSelect = () => {
                        if (paid) return;
                        setSelectedInstallment(1);
                      };
                      return (
                        <ListItem
                          disablePadding
                          sx={{ alignItems: 'stretch' }}
                          secondaryAction={
                            <Stack spacing={0.25} alignItems="flex-end">
                              <Chip size="small" color={paid ? 'success' : 'default'} label={paid ? 'Pagada' : 'Pendiente'} sx={{ fontWeight: 600 }} />
                              {paymentDateLabel && (
                                <Typography variant="caption" color="text.secondary">
                                  {paymentDateLabel}
                                </Typography>
                              )}
                            </Stack>
                          }
                        >
                          <ListItemButton
                            selected={selectedInstallment === 1}
                            onClick={handleSelect}
                            sx={{
                              minHeight: 32,
                              py: 0.5,
                              pr: 7,
                              pl: 1,
                              opacity: paid ? 0.55 : 1,
                              cursor: paid ? 'default' : 'pointer',
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {hasDescription ? (
                                    <IconButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDescription();
                                      }}
                                      size="small"
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        border: '1px solid',
                                        borderColor: openDescription ? 'primary.main' : 'grey.300',
                                      }}
                                    >
                                      <InfoOutlined fontSize="inherit" color={openDescription ? 'primary' : 'action'} />
                                    </IconButton>
                                  ) : (
                                    <Box sx={{ width: 24, height: 24 }} />
                                  )}
                                  <Typography component="span" sx={{ fontSize: '.85rem', fontWeight: 600, color: '#000' }}>
                                    Pago único
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItemButton>
                          {hasDescription && openDescription && (
                            <Typography sx={{ fontSize: '.75rem', color: 'text.secondary', px: 1, pb: 0.5 }}>
                              {description}
                            </Typography>
                          )}
                        </ListItem>
                      );
                    })()}
                  </List>
                </>
              )}
            </>
          )}
          <Divider sx={{ my: 1 }} />
        </Box>
      )}

      {/* Common fields */}
      <PaymentForm
        contractId={contract?.id ?? 0}
        initialValues={vals}
        onChange={setVals}
        externalConcept={concept}
        externalContractUtilityId={selectedUtilityId}
        hideConceptSelect
        hideUtilitySelect
        hideCommissionInfo
        disableAmount={concept === PaymentConcept.COMISION}
        disableCurrency={concept === PaymentConcept.COMISION}
      />

      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={saving || !isValid} onClick={handleSave}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </Box>

      {/* Asignación directa via modal eliminada: usar rutas de comisión */}
    </Modal>
  );
};
