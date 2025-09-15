import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { ContractStatus, ContractType, Contract, ContractGet } from "../../types/contract";
import { getPropertyById } from "../../../property/services/property.service";
import type { Property } from "../../../property/types/property";
import { getUserById } from "../../services/user.service";
import type { User } from "../../types/user";

export type ContractFormValues = {
  propertyId: number;
  userId: string;
  contractType: ContractType | "";
  contractStatus: ContractStatus | "";
  startDate: string;
  endDate: string;
  initialAmount: number | "";
  adjustmentFrequencyMonths: number | "";
  currency: string | "";
  adjustmentIndexId: number | "";
  note: string;
  hasDeposit: boolean;
  depositAmount: number | "";
  depositNote: string;
  // Garantes seleccionados
  guarantorsIds: number[];
};

export function useContractForm(
  initialPropertyId: number,
  initialUserId: string,
  initialData?: Contract | ContractGet,
  onValidityChange?: (v: boolean) => void
) {
  /* ---------- estado ---------- */
  const [values, setValues] = useState<ContractFormValues>({
    propertyId: initialData?.propertyId ?? initialPropertyId,
    userId: initialData?.userId ?? initialUserId,
    contractType: initialData?.contractType ?? "",
    contractStatus: initialData?.contractStatus ?? "",
    startDate: (initialData?.startDate || "").split("T")[0] ?? "",
    endDate: (initialData?.endDate || "").split("T")[0] ?? "",
    adjustmentFrequencyMonths: (initialData as any)?.adjustmentFrequencyMonths ?? "",
    initialAmount: (initialData as any)?.initialAmount ?? "",
    currency: (initialData as any)?.currency ?? (initialData as any)?.paymentCurrency ?? "",
    adjustmentIndexId: (initialData as any)?.adjustmentIndexId ?? (initialData as any)?.adjustmentIndex?.id ?? "",
    note: (initialData as any)?.note ?? "",
    hasDeposit: Boolean((initialData as any)?.hasDeposit) ?? false,
    depositAmount: Boolean((initialData as any)?.hasDeposit) ? (initialData as any)?.depositAmount ?? "" : "",
    depositNote: (initialData as any)?.depositNote ?? "",
    guarantorsIds: Array.isArray((initialData as any)?.guarantors)
      ? ((initialData as any).guarantors as Array<{ id: number }>).map((g) => g.id)
      : [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [property, setProperty] = useState<Property | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const log = (...a: any[]) => console.log("[useContractForm]", ...a);

  /* ---------- recarga si llega initialData (edición) ---------- */
  useEffect(() => {
    if (!initialData) return;
    setValues({
      propertyId: initialData.propertyId,
      userId: initialData.userId,
      contractType: initialData.contractType ?? "",
      contractStatus: initialData.contractStatus ?? "",
      startDate: (initialData.startDate || "").split("T")[0] ?? "",
      endDate: (initialData.endDate || "").split("T")[0] ?? "",
      adjustmentFrequencyMonths: (initialData as any)?.adjustmentFrequencyMonths ?? 12,
      initialAmount: (initialData as any)?.initialAmount ?? 1,
      currency: (initialData as any)?.currency ?? (initialData as any)?.paymentCurrency ?? "ARS",
      adjustmentIndexId: (initialData as any)?.adjustmentIndexId ?? (initialData as any)?.adjustmentIndex?.id ?? "",
      note: (initialData as any)?.note ?? "",
      hasDeposit: Boolean((initialData as any)?.hasDeposit) ?? false,
      depositAmount: Boolean((initialData as any)?.hasDeposit) ? (initialData as any)?.depositAmount ?? 1 : "",
      depositNote: (initialData as any)?.depositNote ?? "",
      guarantorsIds: Array.isArray((initialData as any)?.guarantors)
        ? ((initialData as any).guarantors as Array<{ id: number }>).map((g) => g.id)
        : [],
    });
  }, [initialData]);

  /* ---------- carga propiedad + usuario ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const prop = await getPropertyById(initialPropertyId);
        const resp = await getUserById(initialUserId);
        const usr = resp?.data;
        if (!usr) throw new Error("Usuario no encontrado");
        if (mounted) {
          setProperty(prop as Property);
          setUser(usr as User);
        }
      } catch (err) {
        console.error("Error obteniendo usuario o propiedad", err);
        if (mounted) {
          setUser(null);
          setProperty(null);
          setLoadingData(false);
        }
      } finally {
        if (mounted) setLoadingData(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialPropertyId, initialUserId]);

  /* ---------- validación ---------- */
  const validate = useCallback(() => {
    const e: Record<string, string> = {};

    if (!values.contractType) e.contractType = "Requerido";
    if (!values.contractStatus) e.contractStatus = "Requerido";
    if (!values.startDate) e.startDate = "Requerido";
    if (!values.endDate) e.endDate = "Requerido";
    if (values.startDate && values.endDate && dayjs(values.endDate).isBefore(values.startDate))
      e.endDate = "Fin anterior al inicio";

    // increase ya no es requerido por el DTO
    if (values.adjustmentFrequencyMonths === "" || Number(values.adjustmentFrequencyMonths) <= 0) e.increaseFrequency = "Debe ser > 0";
    if (values.initialAmount === "" || Number(values.initialAmount) <= 0) e.amount = "Debe > 0";
    if (!values.currency) e.currency = "Requerido";
    if (values.hasDeposit) {
      const amt = Number(values.depositAmount);
      if (!amt || amt <= 0) e.depositAmount = "Debe ser > 0";
    }

    setErrors(e);
    onValidityChange?.(!Object.keys(e).length);
    return !Object.keys(e).length;
  }, [values, onValidityChange]);

  useEffect(() => {
    validate();
  }, [values, validate]);

  /* ---------- handlers ---------- */
  const handleChange =
    (field: keyof ContractFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const raw = (e.target as HTMLInputElement).value;
      setValues((prev) => ({
        ...prev,
        [field]: ["amount", "increaseFrequency"].includes(field)
          ? raw // numéricos: se guarda string vacío o string con número, se convierte al enviar
          : raw,
      }));
    };

  const reset = useCallback(() => {
    setValues({
      propertyId: initialPropertyId,
      userId: initialUserId,
      contractType: "",
      contractStatus: "",
      startDate: "",
      endDate: "",
      adjustmentFrequencyMonths: "",
      initialAmount: "",
      currency: "",
      adjustmentIndexId: "",
      note: "",
      hasDeposit: false,
      depositAmount: "",
      depositNote: "",
      guarantorsIds: [],
    });
    setErrors({});
  }, [initialPropertyId, initialUserId]);

  const submit = useCallback(async (): Promise<ContractFormValues | null> => {
    if (!validate()) return null;
    return {
      ...values,
      contractType: values.contractType as ContractType,
      contractStatus: values.contractStatus as ContractStatus,
      initialAmount: Number(values.initialAmount),
      adjustmentFrequencyMonths: Number(values.adjustmentFrequencyMonths),
      // Enviamos LocalDate (YYYY-MM-DD), el backend usa LocalDate para el DTO
      startDate: values.startDate,
      endDate: values.endDate,
      currency: values.currency,
    };
  }, [validate, values]);

  // Helpers para sincronizar desde otros pasos/componentes
  const setExtras = useCallback(
    (extras: Partial<Pick<ContractFormValues, "note" | "hasDeposit" | "depositAmount" | "depositNote">>) => {
      setValues((prev) => ({
        ...prev,
        note: extras.note ?? prev.note,
        hasDeposit: extras.hasDeposit ?? prev.hasDeposit,
        depositAmount: extras.depositAmount ?? prev.depositAmount,
        depositNote: extras.depositNote ?? prev.depositNote,
      }));
    },
    []
  );

  const setGuarantorsIds = useCallback((ids: number[]) => {
    setValues((prev) => ({ ...prev, guarantorsIds: ids ?? [] }));
  }, []);

  // DTO listo para backend
  const getCreateData = useCallback(() => {
    // Retorna el DTO con nombres esperados por backend (ContractCreate)
    return {
      propertyId: values.propertyId,
      userId: values.userId,
      contractType: values.contractType as ContractType,
      contractStatus: values.contractStatus as ContractStatus,
      startDate: values.startDate,
      endDate: values.endDate,
      currency: values.currency as any,
      initialAmount: Number(values.initialAmount) || 0,
      adjustmentFrequencyMonths: Number(values.adjustmentFrequencyMonths) || 0,
      lastPaidAmount: null,
      lastPaidDate: null,
      note: values.note || null,
      hasDeposit: Boolean(values.hasDeposit),
      depositAmount: values.hasDeposit ? Number(values.depositAmount) || 0 : null,
      depositNote: values.hasDeposit ? values.depositNote || null : null,
      adjustmentIndexId: values.adjustmentIndexId ? Number(values.adjustmentIndexId) : null,
      guarantorsIds: Array.isArray(values.guarantorsIds) ? values.guarantorsIds : [],
    };
  }, [values]);

  useEffect(() => {
    // Útil para ver el snapshot completo del form en cada cambio
    log("values:", values);
  }, [values]);
  return {
    values,
    errors,
    property,
    user,
    loadingData,
    handleChange,
    reset,
    submit,
    setExtras,
    setGuarantorsIds,
    getCreateData,
  };
}
