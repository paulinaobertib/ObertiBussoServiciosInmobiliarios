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

export function useIncreaseIndexes() {
  const { handleError } = useApiErrors();
  const [indexes, setIndexes] = useState<IncreaseIndex[]>([]);
  const [loading, setLoading] = useState(false);

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

  const create = useCallback(
    async (data: IncreaseIndexCreate) => {
      try {
        await postIncreaseIndex(data);
        const list = await loadAll();
        // retorna el creado si se encuentra por code+name
        return list.find((i) => i.code === data.code && i.name === data.name) || null;
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    [handleError, loadAll]
  );

  const update = useCallback(
    async (data: IncreaseIndex) => {
      try {
        await putIncreaseIndex(data);
        await loadAll();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [handleError, loadAll]
  );

  const remove = useCallback(
    async (id: number) => {
      try {
        await deleteIncreaseIndex(id);
        await loadAll();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [handleError, loadAll]
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
