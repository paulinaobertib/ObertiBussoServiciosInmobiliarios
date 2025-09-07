// useGuarantors.ts
import { useCallback, useEffect, useState } from "react";
import {
  getAllGuarantors,
  searchGuarantors,
  getGuarantorById,
  getGuarantorByEmail,
  getGuarantorByPhone,
  getGuarantorsByContract,
  getContractsByGuarantor,
  postGuarantor,
  putGuarantor,
  deleteGuarantor,
  addGuarantorToContract,
  removeGuarantorFromContract,
} from "../services/guarantor.service";
import type { GuarantorCreate, Guarantor } from "../types/guarantor";
import { useApiErrors } from "../../shared/hooks/useErrors";

export function useGuarantors() {
  const { handleError } = useApiErrors();

  // ✅ mismo patrón que useUsers
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllGuarantors();
      setGuarantors(list ?? []);
      return list ?? [];
    } catch (e) {
      handleError(e);
      setGuarantors([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    load();
  }, [load]); // 👈 carga inicial (igual a useUsers)
  const fetchAll = useCallback(load, [load]); // 👈 alias (igual a useUsers)

  const fetchByText = useCallback(
    async (q: string) => {
      try {
        const list = await searchGuarantors(q);
        setGuarantors(list ?? []);
        return list ?? [];
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    [handleError]
  );

  // …(tus getters y mutations como estaban)…

  return {
    guarantors,
    loading,
    fetchAll, // 👈 igual que useUsers
    fetchByText, // 👈 igual que useUsers

    // opcional: si usás en otros lados:
    loadAll: load,

    // getters…
    fetchById: async (id: number) => {
      try {
        return await getGuarantorById(id);
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    fetchByEmail: async (email: string) => {
      try {
        return await getGuarantorByEmail(email);
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    fetchByPhone: async (phone: string) => {
      try {
        return await getGuarantorByPhone(phone);
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    fetchByContract: async (contractId: number) => {
      try {
        return await getGuarantorsByContract(contractId);
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    fetchContractsByGuarantor: async (guarantorId: number) => {
      try {
        return await getContractsByGuarantor(guarantorId);
      } catch (e) {
        handleError(e);
        return [] as Guarantor[];
      }
    },

    // mutations…
    create: async (data: GuarantorCreate) => {
      try {
        await postGuarantor(data);
        await load();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    update: async (id: number, data: GuarantorCreate) => {
      try {
        await putGuarantor(id, data);
        await load();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    remove: async (id: number) => {
      try {
        await deleteGuarantor(id);
        await load();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    linkToContract: async (guarantorId: number, contractId: number) => {
      try {
        await addGuarantorToContract(guarantorId, contractId);
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    unlinkFromContract: async (guarantorId: number, contractId: number) => {
      try {
        await removeGuarantorFromContract(guarantorId, contractId);
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
  };
}
