import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { UtilitiesSection } from "../utilities/UtilitiesSection";
import type { Utility } from "../../types/utility";
import { ContractUtilityForm, type ContractUtilityFormHandle } from "./ContractUtilityForm";
import { postContractUtility } from "../../services/contractUtility.service";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { useUtilities } from "../../hooks/useUtilities";
import { getContractUtilitiesByContract } from "../../services/contractUtility.service";

interface Props {
  contractId: number;
  onSaved: () => void;
}

export function ContractUtilitiesStep({ contractId, onSaved }: Props) {
  const { showAlert } = useGlobalAlert();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const { fetchById } = useUtilities();
  const [utilMap, setUtilMap] = useState<Record<number, Utility>>({});
  const [existingUtilityIds, setExistingUtilityIds] = useState<Set<number>>(new Set());

  // Refs por utilityId para recolectar datos
  const formRefs = useRef<Record<number, ContractUtilityFormHandle | null>>({});

  const handleToggle = useCallback(
    (ids: number[]) => {
      // Excluir utilidades ya vinculadas
      const filtered = ids.filter((id) => !existingUtilityIds.has(id));
      if (filtered.length !== ids.length) {
        // hay duplicados respecto del contrato
        showAlert("Algunas utilidades ya están vinculadas y no se pueden agregar de nuevo.", "info");
      }
      setSelectedIds(filtered);
    },
    [existingUtilityIds, showAlert]
  );

  const setFormRef = useCallback((utilityId: number) => (instance: ContractUtilityFormHandle | null) => {
    formRefs.current[utilityId] = instance;
  }, []);

  useEffect(() => {
    (async () => {
      // fetch missing utilities data for the selected ids
      const missing = selectedIds.filter((id) => !utilMap[id]);
      if (missing.length === 0) return;
      const copies = { ...utilMap };
      for (const id of missing) {
        const it = await fetchById(id);
        if (it) copies[id] = it;
      }
      setUtilMap(copies);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  // Cargar utilidades ya vinculadas para evitar duplicados
  useEffect(() => {
    (async () => {
      try {
        const list = await getContractUtilitiesByContract(contractId);
        const ids = new Set<number>((list || []).map((cu) => cu.utilityId));
        setExistingUtilityIds(ids);
      } catch {
        setExistingUtilityIds(new Set());
      }
    })();
  }, [contractId]);

  const submitAll = useCallback(async () => {
    if (!selectedIds.length) {
      showAlert("Seleccioná al menos un servicio", "warning");
      return;
    }
    setSaving(true);
    try {
      for (const uId of selectedIds) {
        const ref = formRefs.current[uId];
        if (!ref) continue;
        const data = ref.getData();
        // Validaciones: monto inicial > 0, último pago si provisto > 0
        if (!(data.initialAmount > 0)) {
          showAlert("El monto inicial debe ser mayor a 0.", "warning");
          setSaving(false);
          return;
        }
        if (data.lastPaidAmount != null && (data.lastPaidAmount as any) !== "" && !(Number(data.lastPaidAmount) > 0)) {
          showAlert("El último monto pagado debe ser mayor a 0.", "warning");
          setSaving(false);
          return;
        }
        // Evitar duplicado por seguridad
        if (existingUtilityIds.has(data.utilityId)) {
          continue;
        }
        await postContractUtility(data);
      }
      showAlert("Servicios creados", "success");
      // refrescar lista de existentes para bloquear duplicados y limpiar selección
      try {
        const list = await getContractUtilitiesByContract(contractId);
        const ids = new Set<number>((list || []).map((cu) => cu.utilityId));
        setExistingUtilityIds(ids);
        setSelectedIds([]);
      } catch {}
      onSaved();
    } catch (e: any) {
      console.error("[ContractUtilitiesStep] error saving", e);
      const msg = e?.response?.data ?? "Error al guardar servicios";
      showAlert(msg, "error");
    } finally {
      setSaving(false);
    }
  }, [selectedIds, onSaved, showAlert]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="subtitle1" fontWeight={700}>
        Seleccioná los servicios y completá sus datos
      </Typography>
      <UtilitiesSection toggleSelect={(ids) => handleToggle(ids)} isSelected={(id) => selectedIds.includes(id)} showActions={true} />

      {selectedIds.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {selectedIds.map((uId) => (
            <ContractUtilityForm
              key={uId}
              ref={setFormRef(uId) as any}
              utility={utilMap[uId] ?? ({ id: uId, name: `Cargando...` } as Utility)}
              contractId={contractId}
            />
          ))}
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button variant="contained" onClick={submitAll} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : "Guardar servicios"}
        </Button>
      </Box>
    </Box>
  );
}
