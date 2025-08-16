import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { ContractCreate, ContractStatus, ContractType, Contract } from "../../types/contract";
import { getPropertyById } from "../../../property/services/property.service";
import type { Property } from "../../../property/types/property";
import { getUserById } from "../../services/user.service";
import type { User } from "../../types/user";

export type ContractFormValues = Omit<
  ContractCreate,
  "contractType" | "contractStatus" | "amount" | "increase" | "increaseFrequency" | "currency"
> & {
  contractType: ContractType | "";
  contractStatus: ContractStatus | "";
  amount: number | "";
  increase: number | "";
  increaseFrequency: number | "";
  currency: string | "";
};

export function useContractForm(
  initialPropertyId: number,
  initialUserId: string,
  initialData?: Contract,
  onValidityChange?: (v: boolean) => void
) {
  /* ---------- estado ---------- */
  const [values, setValues] = useState<ContractFormValues>({
    propertyId: initialData?.propertyId ?? initialPropertyId,
    userId: initialData?.userId ?? initialUserId,
    contractType: initialData?.contractType ?? "",
    contractStatus: initialData?.contractStatus ?? "",
    startDate: initialData?.startDate?.split("T")[0] ?? "",
    endDate: initialData?.endDate?.split("T")[0] ?? "",
    increase: initialData?.increase ?? "",
    increaseFrequency: initialData?.increaseFrequency ?? "",
    amount: initialData?.contractIncrease?.[0]?.amount ?? "",
    currency: initialData?.contractIncrease?.[0]?.currency ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [property, setProperty] = useState<Property | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  /* ---------- recarga si llega initialData (edición) ---------- */
  useEffect(() => {
    if (!initialData) return;
    setValues({
      propertyId: initialData.propertyId,
      userId: initialData.userId,
      contractType: initialData.contractType ?? "",
      contractStatus: initialData.contractStatus ?? "",
      startDate: initialData.startDate?.split("T")[0] ?? "",
      endDate: initialData.endDate?.split("T")[0] ?? "",
      increase: initialData.increase ?? "",
      increaseFrequency: initialData.increaseFrequency ?? "",
      amount: initialData.contractIncrease?.[0]?.amount ?? "",
      currency: initialData.contractIncrease?.[0]?.currency ?? "",
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

    if (values.increase === "" || Number(values.increase) < 0) e.increase = "No negativo";
    if (values.increaseFrequency === "" || Number(values.increaseFrequency) < 0) e.increaseFrequency = "No negativo";
    if (values.amount === "" || Number(values.amount) <= 0) e.amount = "Debe > 0";
    if (!values.currency) e.currency = "Requerido";

    setErrors(e);
    onValidityChange?.(!Object.keys(e).length);
    return !Object.keys(e).length;
  }, [values, onValidityChange]);

  useEffect(() => {
    validate();
  }, [values, validate]);

  /* ---------- handlers ---------- */
  const handleChange = (field: keyof ContractFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setValues((prev) => ({
      ...prev,
      [field]: ["amount", "increase", "increaseFrequency"].includes(field)
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
      increase: "",
      increaseFrequency: "",
      amount: "",
      currency: "",
    });
    setErrors({});
  }, [initialPropertyId, initialUserId]);

  const submit = useCallback(async (): Promise<ContractFormValues | null> => {
    if (!validate()) return null;
    return {
      ...values,
      contractType: values.contractType as ContractType,
      contractStatus: values.contractStatus as ContractStatus,
      amount: Number(values.amount),
      increase: Number(values.increase),
      increaseFrequency: Number(values.increaseFrequency),
      startDate: `${values.startDate}T00:00:00`,
      endDate: `${values.endDate}T00:00:00`,
      currency: values.currency,
    };
  }, [validate, values]);

  return {
    values,
    errors,
    property,
    user,
    loadingData,
    handleChange,
    reset,
    submit,
  };
}
