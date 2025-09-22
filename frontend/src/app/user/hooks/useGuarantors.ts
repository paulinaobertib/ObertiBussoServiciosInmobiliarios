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
import { useGlobalAlert } from "../../shared/context/AlertContext";

export function useGuarantors() {
  const { handleError } = useApiErrors();
  const alertApi: any = useGlobalAlert();

  // ✅ mismo patrón que useUsers
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [loading, setLoading] = useState(false);

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
        description: "Eliminar este garante?",
      });
    }
  }, [alertApi]);

  /* ---------------- carga inicial ---------------- */
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

  /* ---------------- getters ---------------- */
  const fetchById = useCallback(
    async (id: number) => {
      try {
        return await getGuarantorById(id);
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    [handleError]
  );

  const fetchByEmail = useCallback(
    async (email: string) => {
      try {
        return await getGuarantorByEmail(email);
      } catch (e) {
        handleError(e);
        return null;
      }
    },
    [handleError]
  );

  const fetchByPhone = useCallback(
    async (phone: string) => {
      try {
        return await getGuarantorByPhone(phone);
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
        return await getGuarantorsByContract(contractId);
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    [handleError]
  );

  const fetchContractsByGuarantor = useCallback(
    async (guarantorId: number) => {
      try {
        return await getContractsByGuarantor(guarantorId);
      } catch (e) {
        handleError(e);
        return [] as Guarantor[];
      }
    },
    [handleError]
  );

  /* ---------------- mutations ---------------- */
  const create = useCallback(
    async (data: GuarantorCreate) => {
      try {
        await postGuarantor(data);
        await notifySuccess("Garante creado");
        await load();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [handleError, load, notifySuccess]
  );

  const update = useCallback(
    async (id: number, data: GuarantorCreate) => {
      try {
        await putGuarantor(id, data);
        await notifySuccess("Garante actualizado");
        await load();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [handleError, load, notifySuccess]
  );

  const remove = useCallback(
    async (id: number) => {
      const ok = await confirmDanger();
      if (!ok) return false;
      try {
        await deleteGuarantor(id);
        await notifySuccess("Garante eliminado");
        await load();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [handleError, load, confirmDanger, notifySuccess]
  );

  const linkToContract = useCallback(
    async (guarantorId: number, contractId: number) => {
      try {
        await addGuarantorToContract(guarantorId, contractId);
        await notifySuccess("Garante vinculado al contrato");
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [handleError, notifySuccess]
  );

  const unlinkFromContract = useCallback(
    async (guarantorId: number, contractId: number) => {
      const ok = await confirmDanger();
      if (!ok) return false;
      try {
        await removeGuarantorFromContract(guarantorId, contractId);
        await notifySuccess("Garante desvinculado");
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [handleError, confirmDanger, notifySuccess]
  );

  return {
    guarantors,
    loading,
    fetchAll, // 👈 igual que useUsers
    fetchByText, // 👈 igual que useUsers

    // opcional: si usás en otros lados:
    loadAll: load,

    // getters…
    fetchById,
    fetchByEmail,
    fetchByPhone,
    fetchByContract,
    fetchContractsByGuarantor,

    // mutations…
    create,
    update,
    remove,
    linkToContract,
    unlinkFromContract,
  };
}
