import { useCallback, useState } from "react";
import {
  getAllUtilities,
  getUtilityById,
  getUtilityByName,
  getUtilitiesByContract,
  getContractsByUtility,
  postUtility,
  putUtility,
  deleteUtility,
} from "../services/utility.service";
import type { Utility } from "../types/utility";
import type { ContractSimple } from "../types/contract";
import { useApiErrors } from "../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../shared/context/AlertContext";

export function useUtilities() {
  const { handleError } = useApiErrors();
  const alertApi: any = useGlobalAlert();

  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /* ---------------- helpers de alertas ---------------- */
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

  const confirmDanger = useCallback(async () => {
    if (typeof alertApi?.doubleConfirm === "function") {
      return await alertApi.doubleConfirm({
        kind: "error",
        description: "¿Eliminar este servicio?",
      });
    }
  }, [alertApi]);

  /* ---------------- loads ---------------- */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllUtilities();
      setUtilities(list || []);
      return list || [];
    } catch (e) {
      handleError(e);
      setUtilities([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchAll = useCallback(loadAll, [loadAll]);

  const fetchByText = useCallback(
    async (q: string) => {
      const term = (q ?? "").trim().toLowerCase();
      if (!term) return loadAll();
      try {
        // Remoto por nombre (puede ser exacto); lo consideramos válido si contiene el término
        const remote = await getUtilityByName(q).catch(() => null);

        // Garantizar base local para contains
        let base = utilities;
        if (!base || base.length === 0) {
          base = await loadAll();
        }

        const local = (base || []).filter((u) => (u.name || "").toLowerCase().includes(term));

        const merged: Utility[] = [];
        if (remote && (remote.name || "").toLowerCase().includes(term)) {
          merged.push(remote);
        }
        for (const u of local) {
          if (!merged.find((m) => m.id === u.id)) merged.push(u);
        }

        setUtilities(merged);
        return merged;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    [handleError, utilities, loadAll]
  );

  /* ---------------- getters ---------------- */
  const fetchById = useCallback(
    async (id: number) => {
      try {
        return await getUtilityById(id);
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    [handleError]
  );

  const fetchByName = useCallback(
    async (name: string) => {
      try {
        return await getUtilityByName(name);
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    [handleError]
  );

  const fetchByContract = useCallback(
    async (contractId: number) => {
      try {
        return await getUtilitiesByContract(contractId);
      } catch (e) {
        handleError(e);
        return [] as Utility[];
      }
    },
    [handleError]
  );

  const fetchContractsByUtility = useCallback(
    async (utilityId: number) => {
      try {
        return (await getContractsByUtility(utilityId)) as ContractSimple[];
      } catch (e) {
        handleError(e);
        return [] as ContractSimple[];
      }
    },
    [handleError]
  );

  /* ---------------- mutations ---------------- */
  const create = useCallback(
    async (data: Omit<Utility, "id">) => {
      setLoading(true);
      try {
        await postUtility({ id: 0, ...data });
        await notifySuccess("Servicio creado");
        await loadAll();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleError, loadAll, notifySuccess]
  );

  const update = useCallback(
    async (data: Utility) => {
      setLoading(true);
      try {
        await putUtility(data);
        await notifySuccess("Servicio actualizado");
        await loadAll();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleError, loadAll, notifySuccess]
  );

  const remove = useCallback(
    async (id: number) => {
      const ok = await confirmDanger();
      if (!ok) return false;

      setLoading(true);
      try {
        await deleteUtility(id);
        await notifySuccess("Servicio eliminado");
        await loadAll();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleError, loadAll, confirmDanger, notifySuccess]
  );

  return {
    utilities,
    loading,
    // loads
    loadAll,
    fetchAll,
    fetchByText,
    // getters
    fetchById,
    fetchByName,
    fetchByContract,
    fetchContractsByUtility,
    // mutations
    create,
    update,
    remove,
  };
}
