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

export function useUtilities() {
  const { handleError } = useApiErrors();

  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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


  // Getters
  const fetchById = useCallback(async (id: number) => {
    try {
      return await getUtilityById(id);
    } catch (e) {
      handleError(e);
      return null;
    }
  }, [handleError]);

  const fetchByName = useCallback(async (name: string) => {
    try {
      return await getUtilityByName(name);
    } catch (e) {
      handleError(e);
      return null;
    }
  }, [handleError]);

  const fetchByContract = useCallback(async (contractId: number) => {
    try {
      return await getUtilitiesByContract(contractId);
    } catch (e) {
      handleError(e);
      return [] as Utility[];
    }
  }, [handleError]);

  const fetchContractsByUtility = useCallback(async (utilityId: number) => {
    try {
      return (await getContractsByUtility(utilityId)) as ContractSimple[];
    } catch (e) {
      handleError(e);
      return [] as ContractSimple[];
    }
  }, [handleError]);

  // Mutations
  const create = useCallback(async (data: Omit<Utility, "id">) => {
    try {
      await postUtility({ id: 0, ...data });
      await loadAll();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  }, [handleError, loadAll]);

  const update = useCallback(async (data: Utility) => {
    try {
      await putUtility(data);
      await loadAll();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  }, [handleError, loadAll]);

  const remove = useCallback(async (id: number) => {
    try {
      await deleteUtility(id);
      await loadAll();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  }, [handleError, loadAll]);

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
