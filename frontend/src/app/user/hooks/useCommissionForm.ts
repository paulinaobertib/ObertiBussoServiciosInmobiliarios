// src/app/user/hooks/useCommissionForm.ts
import { useEffect, useMemo, useState, useCallback, ChangeEvent } from "react";
import { useGlobalAlert } from "../../shared/context/AlertContext";
import { useApiErrors } from "../../shared/hooks/useErrors";
import { postCommission, putCommission, deleteCommission } from "../services/commission.service";
import type { Commission, CommissionCreate } from "../types/commission";
import { CommissionPaymentType, CommissionStatus } from "../types/commission";
import type { PaymentCurrency } from "../types/payment";

type Action = "add" | "edit" | "delete";

export interface UseCommissionFormArgs {
  action?: Action;
  item?: Commission;
  contractId?: number;
  onSuccess?: () => void;
}

type FormState = {
  id?: number;
  currency: PaymentCurrency | "";
  totalAmount: number | "";
  date: string;
  paymentType: CommissionPaymentType | "";
  installments: number | "";
  status: CommissionStatus | "";
  note: string;
  contractId: number | "";
};

export function useCommissionForm({ action, item, contractId, onSuccess }: UseCommissionFormArgs) {
  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  // Derivar modo desde las props
  const mode: Action = action ?? (item && item.id ? "edit" : "add");
  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    id: item?.id,
    currency: "",
    totalAmount: "",
    date: "",
    paymentType: "",
    installments: "",
    status: "",
    note: "",
    contractId: "",
  });

  /* ------------- Alert helpers (éxito / warning / confirm doble) ------------- */
  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Ok" });
      }
    },
    [alertApi]
  );

  const notifyWarning = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.warning === "function") {
        await alertApi.warning({ title, description, primaryLabel: "Entendido" });
      }
    },
    [alertApi]
  );

  const confirmDanger = useCallback(async () => {
    if (typeof alertApi?.doubleConfirm === "function") {
      return await alertApi.doubleConfirm({
        kind: "error",
        description: "¿Vas a eliminar esta comisión?",
      });
    }
  }, [alertApi]);

  /* ---------------------- precarga / sincronización ---------------------- */
  useEffect(() => {
    if (isEdit && item && item.id != null) {
      setForm({
        id: item.id,
        currency: item.currency,
        totalAmount: item.totalAmount,
        date: (item.date || "").split("T")[0] ?? "",
        paymentType: item.paymentType,
        installments: item.installments,
        status: item.status,
        note: item.note ?? "",
        contractId: item.contractId,
      });
    } else if (isAdd && contractId && contractId > 0) {
      setForm((prev) => ({ ...prev, contractId }));
    }
  }, [isAdd, isEdit, item, contractId]);

  // Si cambia a COMPLETO, forzar cuotas=1
  useEffect(() => {
    if (form.paymentType === CommissionPaymentType.COMPLETO) {
      setForm((prev) => ({ ...prev, installments: 1 }));
    }
  }, [form.paymentType]);

  /* ------------------------------ handlers ------------------------------ */
  const handleField = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    let value: any = e.target.value;
    if (field === "totalAmount" || field === "installments" || field === "contractId") {
      value = value === "" ? "" : Number(value);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ----------------------------- validación ----------------------------- */
  const isCuotas = form.paymentType === CommissionPaymentType.CUOTAS;

  const hasContract = useMemo(
    () => (contractId != null && Number(contractId) > 0) || (form.contractId !== "" && Number(form.contractId) > 0),
    [contractId, form.contractId]
  );

  const isValid = isDelete
    ? true
    : hasContract &&
      Number(form.totalAmount) > 0 &&
      !!form.currency &&
      !!form.date &&
      !!form.status &&
      !!form.paymentType &&
      (!isCuotas || Number(form.installments) > 0);

  /* ------------------------------- acciones ------------------------------ */
  const submit = useCallback(async () => {
    if (!isValid) {
      await notifyWarning("Faltan datos", "Completá los campos obligatorios.");
      return false;
    }

    try {
      setSaving(true);

      if (isDelete) {
        if (!form.id) throw new Error("Falta el ID para eliminar.");
        const ok = await confirmDanger();
        if (!ok) return false;

        await deleteCommission(form.id);
        await notifySuccess("Comisión eliminada con éxito");
        onSuccess?.();
        return true;
      }

      const payload: CommissionCreate = {
        currency: form.currency as PaymentCurrency,
        totalAmount: Number(form.totalAmount),
        date: form.date,
        paymentType: form.paymentType as CommissionPaymentType,
        installments: isCuotas ? Number(form.installments) : 1,
        status: form.status as CommissionStatus,
        note: form.note,
        contractId: (contractId as number) || Number(form.contractId),
      };

      if (isAdd) {
        await postCommission(payload);
        await notifySuccess("Comisión creada correctamente");
      } else if (isEdit) {
        if (!form.id) throw new Error("Falta el ID para editar.");
        await putCommission({ ...payload, id: form.id } as Commission);
        await notifySuccess("Comisión actualizada correctamente");
      } else {
        throw new Error("Acción desconocida.");
      }

      onSuccess?.();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    isValid,
    isDelete,
    isAdd,
    isEdit,
    form.id,
    form.currency,
    form.totalAmount,
    form.date,
    form.paymentType,
    form.installments,
    form.status,
    form.note,
    form.contractId,
    isCuotas,
    contractId,
    notifyWarning,
    confirmDanger,
    notifySuccess,
    handleError,
    onSuccess,
  ]);

  return {
    // estado
    form,
    setForm,
    saving,
    isValid,
    isAdd,
    isEdit,
    isDelete,
    isCuotas,

    // handlers
    handleField,
    submit,
  };
}
