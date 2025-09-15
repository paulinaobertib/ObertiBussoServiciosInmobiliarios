import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { PaymentForm, PaymentFormValues } from "./PaymentForm";
import { postPayment } from "../../services/payment.service";
import type { Contract } from "../../types/contract";
import type { PaymentCreate } from "../../types/payment";
import { PaymentCurrency, PaymentConcept } from "../../types/payment";
import { patchCommissionStatus } from "../../services/commission.service";
import type { Commission } from "../../types/commission";
import { CommissionStatus, CommissionPaymentType } from "../../types/commission";
import { getContractUtilitiesByContract } from "../../services/contractUtility.service";
import { getUtilityById } from "../../services/utility.service";
import type { ContractUtilityGet } from "../../types/contractUtility";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import dayjs from "dayjs";

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

  useEffect(() => {
    setVals(empty);
    setCommission(null);
    setCommissionPaidCount(0);
    setConcept("");
    setSelectedUtilityId("");
    setUtilities([]);
    setSelectedInstallment(null);
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

  // Prefijar importe y moneda cuando sea comisión (monto por cuota o único)
  useEffect(() => {
    if (!open) return;
    if (concept !== PaymentConcept.COMISION) return;
    if (!commission) return;
    const installments = commission.paymentType === CommissionPaymentType.CUOTAS ? (commission.installments || 1) : 1;
    const perInstallment = installments > 0 ? Number((Number(commission.totalAmount) / installments).toFixed(2)) : Number(commission.totalAmount);
    setVals((prev) => ({
      ...prev,
      paymentCurrency: (commission.currency as unknown as PaymentCurrency),
      amount: perInstallment,
    }));
  }, [open, concept, commission]);

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
                  <List dense>
                    {Array.from({ length: commission.installments }, (_, i) => i + 1).map((n) => {
                      const paid = n <= commissionPaidCount;
                      const next = Math.min(commission.installments || 1, commissionPaidCount + 1);
                      const disabled = paid || n !== next;
                      return (
                        <ListItem key={n} disablePadding>
                          <ListItemButton
                            selected={selectedInstallment === n}
                            disabled={disabled}
                            onClick={() => setSelectedInstallment(n)}
                          >
                            <ListItemText primary={`Cuota #${n}`} secondary={paid ? "Pagada" : "Pendiente"} />
                          </ListItemButton>
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
                  <List dense>
                    {(() => {
                      const paid = commissionPaidCount > 0;
                      return (
                        <ListItem disablePadding>
                          <ListItemButton
                            selected={selectedInstallment === 1}
                            disabled={paid}
                            onClick={() => setSelectedInstallment(1)}
                          >
                            <ListItemText primary={`Pago único`} secondary={paid ? "Pagada" : "Pendiente"} />
                          </ListItemButton>
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
