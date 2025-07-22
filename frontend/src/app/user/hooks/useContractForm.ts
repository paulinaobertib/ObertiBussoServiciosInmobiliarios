// src/app/contract/hooks/useContractForm.ts
import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";

import {
  ContractCreate,
  ContractStatus,
  ContractType,
  Contract,
} from "../types/contract";
import { getPropertyById } from "../../property/services/property.service";
import type { Property } from "../../property/types/property";
import { getUserById } from "../services/user.service";
import type { User } from "../types/user"; 

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
    startDate: initialData?.startDate ?? dayjs().format("YYYY-MM-DD"),
    endDate:
      initialData?.endDate ?? dayjs().add(12, "month").format("YYYY-MM-DD"),
    increase: initialData?.increase ?? 0,
    increaseFrequency: initialData?.increaseFrequency ?? 12,
    amount: (initialData as any)?.amount ?? 0,
    currency: (initialData as any)?.currency ?? "ARS",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [property, setProperty] = useState<Property | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const propRes = await getPropertyById(initialPropertyId);
        const p: Property = (propRes as any).data ?? propRes;
        const userRes = await getUserById(initialUserId);
        const u: User = (userRes as any).data ?? userRes;
        if (!mounted) return;
        setProperty(p);
        setUser(u);
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
