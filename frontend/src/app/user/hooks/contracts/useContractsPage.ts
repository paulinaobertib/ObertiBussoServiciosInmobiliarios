import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { getAllContracts, getContractsByUserId } from "../../services/contract.service";
import type { Contract } from "../../types/contract";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { useApiErrors } from "../../../shared/hooks/useErrors";

export function useContractsPage() {
  const { info, isAdmin } = useAuthContext();
  const userId = info?.id!;
  const navigate = useNavigate();
  const location = useLocation();
  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  const [all, setAll] = useState<Contract[]>([]);
  const [filtered, setFiltered] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | Contract["contractStatus"]>("ALL");

  // Modales (propios de tu UI)
  const [paying, setPaying] = useState<Contract | null>(null);
  const [increasing, setIncreasing] = useState<Contract | null>(null);
  const [history, setHistory] = useState<Contract | null>(null);

  /* --------------------------- carga --------------------------- */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = isAdmin ? await getAllContracts() : await getContractsByUserId(userId);
      setAll(data);
    } catch (e) {
      handleError(e);
      setAll([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userId, handleError]);

  useEffect(() => {
    load();
  }, [load]);

  // Mensaje al venir de "crear contrato"
  useEffect(() => {
    const state = location.state as any;
    if (!state?.justCreated) return;

    const id = Number(state.createdId);
    const title = "Contrato creado con éxito";
    const description = "Para agregar servicios y comisión inmobiliaria, podés ir al detalle ahora.";

    (async () => {
      if (typeof alertApi?.confirm === "function") {
        const go = await alertApi.confirm({
          title,
          description,
          primaryLabel: "Ir al detalle",
          secondaryLabel: "Más tarde",
        });

        if (go && id) {
          // Ir al detalle y NO limpiar el state acá (se desmonta esta página)
          navigate(`/contracts/${id}`, { replace: true });
          return; // <--- clave: no sigas a limpiar el state de la lista
        }

        // Si no va al detalle, ahora sí limpiamos el state de la URL actual
        navigate(location.pathname, { replace: true, state: {} });
      } else if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Cerrar" });
        navigate(location.pathname, { replace: true, state: {} });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);
  /* --------------------------- filtrado --------------------------- */
  useEffect(() => {
    setFiltered(statusFilter === "ALL" ? all : all.filter((c) => c.contractStatus === statusFilter));
  }, [all, statusFilter]);

  const handleSearch = useCallback(
    (results: Contract[]) => {
      setFiltered(statusFilter === "ALL" ? results : results.filter((c) => c.contractStatus === statusFilter));
    },
    [statusFilter]
  );

  const refresh = load;

  return {
    all,
    filtered,
    loading,
    statusFilter,
    setStatusFilter,
    handleSearch,
    paying,
    setPaying,
    increasing,
    setIncreasing,
    history,
    setHistory,
    refresh,
    isAdmin,
    navigate,
  };
}
