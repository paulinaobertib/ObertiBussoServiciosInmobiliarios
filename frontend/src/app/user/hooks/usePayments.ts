import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { useGlobalAlert } from "../../shared/context/AlertContext";

import { postPayment } from "../services/payment.service";
import { patchCommissionStatus } from "../services/commission.service";
import { getContractUtilitiesByContract } from "../services/contractUtility.service";
import { getUtilityById } from "../services/utility.service";

import type { Contract } from "../types/contract";
import type { Payment, PaymentCreate } from "../types/payment";
import { PaymentConcept, PaymentCurrency } from "../types/payment";
import { CommissionPaymentType, CommissionStatus } from "../types/commission";
import type { Commission } from "../types/commission";
import type { ContractUtilityGet } from "../types/contractUtility";
import type { PaymentFormValues } from "../components/payments/PaymentForm";

type UtilityRow = {
  id: number;
  utilityId: number;
  name: string;
  periodicity: any;
  lastPaidDate?: string | null;
  lastPaidAmount?: number | null;
};

export type UsePaymentDialogOptions = {
  open: boolean;
  contract: Contract | null;
  onSaved: () => void;
  onClose: () => void;
  presetConcept?: PaymentConcept;
  presetUtilityId?: number;
  presetInstallment?: number | null;
  fixedConcept?: PaymentConcept;
};

export function usePaymentDialog({
  open,
  contract,
  onSaved,
  onClose,
  presetConcept,
  presetUtilityId,
  presetInstallment,
  fixedConcept,
}: UsePaymentDialogOptions) {
  const alertApi: any = useGlobalAlert();

  /* ---------- alert helpers (nuevas) ---------- */
  const notifySuccess = async (title: string, description?: string) => {
    if (typeof alertApi?.success === "function") {
      await alertApi.success({ title, description, primaryLabel: "Ok" });
    }
  };
  const notifyError = async (message: string, title = "Error") => {
    if (typeof alertApi?.error === "function") {
      await alertApi.error({ title, description: message, primaryLabel: "Ok" });
    }
  };

  /* ---------- estado ---------- */
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

  const [concept, setConcept] = useState<PaymentConcept | "">("");
  const [selectedUtilityId, setSelectedUtilityId] = useState<number | "">("");

  const [utilities, setUtilities] = useState<UtilityRow[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});

  /* ---------- resets al cambiar contrato ---------- */
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

  /* ---------- presets al abrir ---------- */
  useEffect(() => {
    if (!open) return;
    if (fixedConcept) setConcept(fixedConcept);
    else if (presetConcept) setConcept(presetConcept);
    if (presetUtilityId) setSelectedUtilityId(presetUtilityId);
    if (presetInstallment != null) setSelectedInstallment(presetInstallment);
  }, [open, presetConcept, presetUtilityId, fixedConcept, presetInstallment]);

  /* ---------- cargar comisión desde el contrato ---------- */
  useEffect(() => {
    if (!open || !contract) return;
    const c = (contract as any)?.commission as Commission | null;
    setCommission(c ?? null);

    if (c?.id) {
      const paymentsSource = Array.isArray((contract as any)?.payments) ? (contract as any).payments : [];
      const count = paymentsSource.filter(
        (p: any) => p?.concept === "COMISION" && Number(p?.commissionId) === Number(c.id)
      ).length;
      setCommissionPaidCount(count);
      const next = c.paymentType === CommissionPaymentType.CUOTAS ? Math.max(Math.min(c.installments || 1, count + 1), 1) : 1;
      const desired = presetInstallment ?? next;
      setSelectedInstallment(Math.min(desired, next));

      const targetConcept = (fixedConcept ?? concept ?? "") as PaymentConcept | "";
      if (targetConcept === PaymentConcept.COMISION) {
        const installmentsRaw =
          c.paymentType === CommissionPaymentType.CUOTAS ? Number(c.installments) || 1 : 1;
        const installments = Math.max(1, installmentsRaw);
        const totalAmount = Number(c.totalAmount ?? 0);
        const perInstallment = installments > 0 ? totalAmount / installments : totalAmount;
        const normalized = Number.isFinite(perInstallment) ? Number(perInstallment.toFixed(2)) : 0;
        setVals((prev) => ({
          ...prev,
          paymentCurrency: (c.currency ?? "") as PaymentCurrency,
          amount: normalized,
        }));
      }
    } else {
      setCommissionPaidCount(0);
      setSelectedInstallment(null);
    }
  }, [open, contract, presetInstallment, concept, fixedConcept]);

  /* ---------- limpiar expansiones cada vez que abre ---------- */
  useEffect(() => {
    if (!open) return;
    setExpandedDescriptions({});
  }, [open]);

  /* ---------- prefijar importe/moneda si es comisión ---------- */
  useEffect(() => {
    if (!open) return;
    if (concept !== "COMISION") return;
    if (!commission) return;
    const installmentsRaw =
      commission.paymentType === CommissionPaymentType.CUOTAS ? Number(commission.installments) || 1 : 1;
    const installments = Math.max(1, installmentsRaw);
    const totalAmount = Number(commission.totalAmount ?? 0);
    const perInstallment = installments > 0 ? totalAmount / installments : totalAmount;
    if (!Number.isFinite(perInstallment)) return;
    const normalized = Number(perInstallment.toFixed(2));
    setVals((prev) => ({
      ...prev,
      paymentCurrency: commission.currency as unknown as PaymentCurrency,
      amount: normalized,
    }));
  }, [open, concept, commission, selectedInstallment]);

  /* ---------- pagos de comisión (ordenados) ---------- */
  const commissionPayments = useMemo(() => {
    if (!commission?.id) return [] as Payment[];
    const list = Array.isArray((contract as any)?.payments)
      ? (contract as any).payments.filter(
          (p: any) => p?.concept === "COMISION" && Number(p?.commissionId) === Number(commission.id)
        )
      : [];
    return [...list].sort(
      (a: any, b: any) => dayjs(a.date ?? a.paymentDate).valueOf() - dayjs(b.date ?? b.paymentDate).valueOf()
    );
  }, [contract, commission]);

  /* ---------- cargar servicios del contrato ---------- */
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
              name: "Servicio",
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

  /* ---------- coherencia por concepto ---------- */
  useEffect(() => {
    if (concept !== "EXTRA") setSelectedUtilityId("");
    if (concept !== "COMISION") setSelectedInstallment(null);
  }, [concept]);

  /* ---------- validación ---------- */
  const isValid = useMemo(() => {
    const base = vals.date && vals.amount !== "" && Number(vals.amount) > 0 && vals.paymentCurrency && concept;
    if (!base) return false;
    if (concept === "EXTRA") return Boolean(selectedUtilityId);
    if (concept === "COMISION") {
      if (!commission) return false;
      return Boolean(commission.id) && selectedInstallment != null;
    }
    return true;
  }, [vals, concept, selectedUtilityId, commission, selectedInstallment]);

  /* ---------- helpers UI ---------- */
  const toggleDescription = (n: number) => setExpandedDescriptions((prev) => ({ ...prev, [n]: !prev[n] }));

  /* ---------- guardar (con alertas aquí) ---------- */
  const handleSave = async () => {
    if (!contract || !isValid) return;
    setSaving(true);

    const payload: PaymentCreate = {
      paymentCurrency: vals.paymentCurrency as PaymentCurrency,
      amount: Number(vals.amount),
      date: `${vals.date}T00:00:00`,
      description: vals.description,
      concept: concept as PaymentConcept,
      contractId: contract.id,
      contractUtilityId: concept === "EXTRA" ? Number(selectedUtilityId) : undefined,
      commissionId: concept === "COMISION" ? Number(commission?.id) : undefined,
    };

    try {
      await postPayment(payload);

      if (concept === "COMISION" && commission?.id) {
        const nextCount = commissionPaidCount + 1;
        let newStatus: CommissionStatus | null = null;
        if (commission.paymentType === CommissionPaymentType.COMPLETO) {
          newStatus = CommissionStatus.PAGADA;
        } else if ((commission.installments ?? 0) > 0) {
          newStatus =
            nextCount >= (commission.installments as number) ? CommissionStatus.PAGADA : CommissionStatus.PARCIAL;
        } else {
          newStatus = CommissionStatus.PARCIAL;
        }
        try {
          await patchCommissionStatus(commission.id, newStatus);
        } catch {
          // no bloqueamos si falla
        }
      }

      await notifySuccess("Pago creado", "Se registró correctamente.");
      onSaved();
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? "Error al crear el pago";
      await notifyError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  return {
    // form y selección
    vals,
    setVals,
    concept,
    setConcept,

    // comisión
    commission,
    commissionPaidCount,
    commissionPayments,
    selectedInstallment,
    setSelectedInstallment,
    expandedDescriptions,
    toggleDescription,

    // servicios/extra
    utilities,
    selectedUtilityId,
    setSelectedUtilityId,

    // control
    isValid,
    saving,

    // acción principal
    handleSave,
  };
}
