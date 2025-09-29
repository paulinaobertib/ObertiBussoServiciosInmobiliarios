import { useCallback, useState } from "react";
import {
  getAllIncreaseIndexes,
  getIncreaseIndexById,
  getIncreaseIndexByCode,
  getIncreaseIndexByName,
  getContractsByIncreaseIndex,
  getIncreaseIndexByContract,
  postIncreaseIndex,
  putIncreaseIndex,
  deleteIncreaseIndex,
} from "../services/increaseIndex.service";
import type { IncreaseIndex, IncreaseIndexCreate } from "../types/increaseIndex";
import type { ContractSimple } from "../types/contract";
import { useApiErrors } from "../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../shared/context/AlertContext";

export function useIncreaseIndexes() {
  const { handleError } = useApiErrors();
  const alertApi: any = useGlobalAlert();

  const [indexes, setIndexes] = useState<IncreaseIndex[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- helpers de alertas ---------------- */
  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Ok" });
      }
    },
    [alertApi]
  );

  const confirmDanger = useCallback(async () => {
    if (typeof alertApi?.doubleConfirm === "function") {
      return await alertApi.doubleConfirm({
        kind: "error",
        description: "¿Eliminar este Índice?",
      });
    }
  }, [alertApi]);

  /* ---------------- loads ---------------- */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllIncreaseIndexes();
      setIndexes(list || []);
      return list || [];
    } catch (e) {
      handleError(e);
      setIndexes([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchAll = useCallback(loadAll, [loadAll]);

  const fetchByText = useCallback(
    async (q: string) => {
      try {
        const results: IncreaseIndex[] = [];
        // Intentamos por nombre y por código
        const byName = await getIncreaseIndexByName(q).catch(() => null);
        const byCode = await getIncreaseIndexByCode(q).catch(() => null);
        if (byName) results.push(byName);
        if (byCode && !results.find((r) => r.id === byCode.id)) results.push(byCode);
        // Si no hay resultados remotos, devolvemos filtro local por conveniencia
        if (!results.length) {
          return indexes.filter(
            (i) => i.code.toLowerCase().includes(q.toLowerCase()) || i.name.toLowerCase().includes(q.toLowerCase())
          );
        }
        return results;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    [handleError, indexes]
  );

  /* ---------------- getters ---------------- */
  const fetchById = useCallback(
    async (id: number) => {
      try {
        return await getIncreaseIndexById(id);
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    [handleError]
  );

  const fetchContracts = useCallback(
    async (indexId: number) => {
      try {
        return (await getContractsByIncreaseIndex(indexId)) as ContractSimple[];
      } catch (e) {
        handleError(e);
        return [] as ContractSimple[];
      }
    },
    [handleError]
  );

  const fetchByContract = useCallback(
    async (contractId: number) => {
      try {
        return await getIncreaseIndexByContract(contractId);
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    [handleError]
  );

  /* ---------------- mutations ---------------- */
  const create = useCallback(
    async (data: IncreaseIndexCreate) => {
      try {
        await postIncreaseIndex(data);
        const list = await loadAll();
        await notifySuccess("Índice creado");
        // retorna el creado si se encuentra por code+name
        return list.find((i) => i.code === data.code && i.name === data.name) || null;
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    [handleError, loadAll, notifySuccess]
  );

  const update = useCallback(
    async (data: IncreaseIndex) => {
      try {
        await putIncreaseIndex(data);
        await loadAll();
        await notifySuccess("Índice actualizado");
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [handleError, loadAll, notifySuccess]
  );

  const remove = useCallback(
    async (id: number) => {
      const ok = await confirmDanger();
      if (!ok) return false;

      try {
        await deleteIncreaseIndex(id);
        await loadAll();
        await notifySuccess("Índice eliminado");
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [handleError, loadAll, confirmDanger, notifySuccess]
  );

  return {
    indexes,
    loading,
    // loads/search
    loadAll,
    fetchAll,
    fetchByText,
    // getters
    fetchById,
    fetchContracts,
    fetchByContract,
    // mutations
    create,
    update,
    remove,
  };
}
