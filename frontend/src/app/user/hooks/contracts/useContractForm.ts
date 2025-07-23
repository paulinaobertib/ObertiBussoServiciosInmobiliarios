import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";

import {
  ContractCreate,
  ContractStatus,
  ContractType,
  Contract,
} from "../../types/contract";
import { getPropertyById } from "../../../property/services/property.service";
import type { Property } from "../../../property/types/property";
import { getUserById } from "../../services/user.service";
import type { User } from "../../types/user";

export type ContractFormValues = ContractCreate & {
  amount: number;
  currency: string;
};

export function useContractForm(
  initialPropertyId: number,
  initialUserId: string,
  initialData?: Contract,
  onValidityChange?: (valid: boolean) => void
) {
  const [values, setValues] = useState<ContractFormValues>({
    propertyId: initialData?.propertyId ?? initialPropertyId,
    userId: initialData?.userId ?? initialUserId,
    contractType: initialData?.contractType ?? ContractType.VIVIENDA,
    contractStatus: initialData?.contractStatus ?? ContractStatus.ACTIVO,
    startDate:
      initialData?.startDate.split("T")[0] ?? dayjs().format("YYYY-MM-DD"),
    endDate:
      initialData?.endDate.split("T")[0] ??
      dayjs().add(12, "month").format("YYYY-MM-DD"),
    increase: initialData?.increase ?? 0,
    increaseFrequency: initialData?.increaseFrequency ?? 12,
    // tomo monto y moneda del primer contractIncrease si existe
    amount: initialData?.contractIncrease?.[0]?.amount ?? 0,
    currency: initialData?.contractIncrease?.[0]?.currency ?? "ARS",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [property, setProperty] = useState<Property | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Cuando llegue initialData, recargo TODOS los valores
  useEffect(() => {
    if (!initialData) return;
    setValues({
      propertyId: initialData.propertyId,
      userId: initialData.userId,
      contractType: initialData.contractType,
      contractStatus: initialData.contractStatus,
      startDate: initialData.startDate.split("T")[0],
      endDate: initialData.endDate.split("T")[0],
      increase: initialData.increase,
      increaseFrequency: initialData.increaseFrequency,
      amount: initialData.contractIncrease?.[0]?.amount ?? 0,
      currency: initialData.contractIncrease?.[0]?.currency ?? "ARS",
    });
  }, [initialData]);

  // Cargo datos de propiedad y usuario
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const prop = (await getPropertyById(initialPropertyId)) as Property;
        const usr = (await getUserById(initialUserId)) as unknown as User;
        if (mounted) {
          setProperty(prop);
          setUser(usr);
        }
      } finally {
        if (mounted) setLoadingData(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialPropertyId, initialUserId]);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!values.startDate) e.startDate = "Requerido";
    if (!values.endDate) e.endDate = "Requerido";
    if (dayjs(values.endDate).isBefore(values.startDate))
      e.endDate = "Fin anterior al inicio";
    if (values.increase < 0) e.increase = "No negativo";
    if (values.increaseFrequency <= 0) e.increaseFrequency = "Debe > 0";
    if (values.amount <= 0) e.amount = "Debe > 0";
    if (!values.currency) e.currency = "Requerido";

    setErrors(e);
    onValidityChange?.(Object.keys(e).length === 0);
    return Object.keys(e).length === 0;
  }, [values, onValidityChange]);

  useEffect(() => {
    validate();
  }, [values, validate]);

  const handleChange =
    (field: keyof ContractFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({
        ...prev,
        [field]: field === "amount" ? Number(e.target.value) : e.target.value,
      }));

  const reset = useCallback(() => {
    setValues({
      propertyId: initialPropertyId,
      userId: initialUserId,
      contractType: ContractType.VIVIENDA,
      contractStatus: ContractStatus.ACTIVO,
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: dayjs().add(12, "month").format("YYYY-MM-DD"),
      increase: 0,
      increaseFrequency: 12,
      amount: 0,
      currency: "ARS",
    });
    setErrors({});
  }, [initialPropertyId, initialUserId]);

  const submit = useCallback(async (): Promise<ContractFormValues | null> => {
    if (!validate()) return null;
    return {
      ...values,
      startDate: `${values.startDate}T00:00:00`,
      endDate: `${values.endDate}T00:00:00`,
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
