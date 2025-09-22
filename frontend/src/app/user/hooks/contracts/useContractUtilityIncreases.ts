// src/app/user/hooks/useContractUtilityIncreases.ts
import { useEffect, useState, useCallback } from "react";
import {
  getContractUtilityIncreases,
  // Ajustá estos nombres si tu service usa otros:
  postContractUtilityIncrease,
  putContractUtilityIncrease,
  deleteContractUtilityIncrease,
} from "../../services/contractUtilityIncrease.service";
import type { ContractUtilityIncrease } from "../../types/contractUtilityIncrease";
import { useApiErrors } from "../../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../../shared/context/AlertContext";

type IncreaseCreate = Omit<ContractUtilityIncrease, "id">;
type IncreaseUpdate = ContractUtilityIncrease;

export function useContractUtilityIncreases(contractUtilityId: number | null | undefined, refreshFlag: number = 0) {
  const { handleError } = useApiErrors();
  const alertApi: any = useGlobalAlert();

  const [increases, setIncreases] = useState<ContractUtilityIncrease[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ----------------- helpers de alertas dentro del hook ----------------- */
  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Ok" });
      } else if (typeof alertApi?.showAlert === "function") {
        alertApi.showAlert(description ?? title, "success");
      }
    },
    [alertApi]
  );

  const notifyWarning = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.warning === "function") {
        await alertApi.warning({ title, description, primaryLabel: "Entendido" });
      } else if (typeof alertApi?.showAlert === "function") {
        alertApi.showAlert(description ?? title, "warning");
      }
    },
    [alertApi]
  );

  const confirmDanger = useCallback(
    async (title: string, description = "Esta acción no se puede deshacer.") => {
      if (typeof alertApi?.doubleConfirm === "function") {
        return await alertApi.doubleConfirm({
          kind: "error",
          title,
          description,
          step2Title: "¿Confirmar definitivamente?",
          step2Description: "Confirmá nuevamente para continuar.",
          primaryLabel: "Continuar",
          secondaryLabel: "Cancelar",
          swapOnSecond: true,
        });
      }
      if (typeof alertApi?.confirm === "function") {
        return await alertApi.confirm({
          title: "Confirmar acción",
          description: `${title}. ${description}`,
          primaryLabel: "Eliminar",
          secondaryLabel: "Cancelar",
        });
      }
      return window.confirm(`${title}\n\n${description}`);
    },
    [alertApi]
  );

  /* ------------------------------ carga ------------------------------ */
  const reload = useCallback(async () => {
    if (!contractUtilityId) {
      setIncreases([]);
      setError(null);
      return [] as ContractUtilityIncrease[];
    }
    setLoading(true);
    try {
      const list = await getContractUtilityIncreases(contractUtilityId);
      setIncreases(list as any);
      setError(null);
      return list as any;
    } catch (e) {
      setError(handleError(e)); // muestra modal de error + devuelve string
      setIncreases([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [contractUtilityId, handleError]);

  useEffect(() => {
    reload();
  }, [reload, refreshFlag]);

  /* ------------------------------ create ------------------------------ */
  const createIncrease = useCallback(
    async (payload: IncreaseCreate) => {
      if (!contractUtilityId && !payload?.contractUtilityId) {
        await notifyWarning("Falta el servicio", "No se encontró el servicio de contrato.");
        return null;
      }
      setSaving(true);
      try {
        const created = await postContractUtilityIncrease({
          ...payload,
          contractUtilityId: payload.contractUtilityId ?? (contractUtilityId as number),
        } as IncreaseCreate);
        await notifySuccess("Aumento creado");
        await reload();
        return created;
      } catch (e) {
        handleError(e);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [contractUtilityId, reload, notifySuccess, notifyWarning, handleError]
  );

  /* ------------------------------ update ------------------------------ */
  const updateIncrease = useCallback(
    async (payload: IncreaseUpdate) => {
      setSaving(true);
      try {
        await putContractUtilityIncrease(payload);
        await notifySuccess("Aumento actualizado");
        await reload();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [reload, notifySuccess, handleError]
  );

  /* ------------------------------ delete ------------------------------ */
  const removeIncrease = useCallback(
    async (id: number, { confirm = true }: { confirm?: boolean } = {}) => {
      if (confirm) {
        const ok = await confirmDanger("Vas a eliminar este aumento");
        if (!ok) return false;
      }
      setDeletingId(id);
      try {
        await deleteContractUtilityIncrease(id);
        await notifySuccess("Aumento eliminado");
        await reload();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [reload, notifySuccess, confirmDanger, handleError]
  );

  return {
    // datos
    increases,
    loading,
    error,

    // estados de acción (para botones)
    saving,
    deletingId,

    // API desde el hook (con alertas adentro)
    reload,
    createIncrease,
    updateIncrease,
    removeIncrease,
  };
}
