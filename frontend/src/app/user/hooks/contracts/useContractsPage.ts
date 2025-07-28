// src/app/user/hooks/contracts/useContractsPage.ts
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { useAuthContext } from "../../context/AuthContext";
import {
  getAllContracts,
  getContractsByUserId,
  deleteContract,
  patchContractStatus,
} from "../../services/contract.service";
import type { Contract } from "../../types/contract";

export function useContractsPage() {
  const { info, isAdmin } = useAuthContext();
  const userId = info?.id!;
  const navigate = useNavigate();
  const { ask, DialogUI } = useConfirmDialog();

  const [all, setAll] = useState<Contract[]>([]);
  const [filtered, setFiltered] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | Contract["contractStatus"]
  >("ALL");

  // Modales
  const [paying, setPaying] = useState<Contract | null>(null);
  const [increasing, setIncreasing] = useState<Contract | null>(null);
  const [history, setHistory] = useState<Contract | null>(null);

  // 1) Memoizamos la llamada para no recrearla en cada render :contentReference[oaicite:0]{index=0}
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = isAdmin
        ? await getAllContracts()
        : await getContractsByUserId(userId);
      setAll(data);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userId]); // ← cambia solo si isAdmin o userId cambian

  // 2️⃣  Efecto: una sola vez (o cuando load cambie)
  useEffect(() => {
    load();
  }, [load]);

  // Filtrado por estado
  useEffect(() => {
    setFiltered(
      statusFilter === "ALL"
        ? all
        : all.filter((c) => c.contractStatus === statusFilter)
    );
  }, [all, statusFilter]);

  const handleSearch = useCallback(
    (results: Contract[]) => {
      setFiltered(
        statusFilter === "ALL"
          ? results
          : results.filter((c) => c.contractStatus === statusFilter)
      );
    },
    [statusFilter]
  );

  const handleDelete = (c: Contract) => {
    ask(`¿Eliminar contrato #${c.id}?`, async () => {
      await deleteContract(c.id);
      await load();
    });
  };

  const handleToggleStatus = (c: Contract) => {
    const msg =
      c.contractStatus === "ACTIVO"
        ? `¿Marcar #${c.id} como inactivo?`
        : `¿Reactivar #${c.id}?`;
    ask(msg, async () => {
      await patchContractStatus(c.id);
      await load();
    });
  };

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
    handleDelete,
    handleToggleStatus,
    refresh,
    isAdmin,
    navigate,
    DialogUI,
  };
}
