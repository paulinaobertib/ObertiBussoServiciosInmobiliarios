import { useEffect, useRef, useState } from "react";
import { Box, Button, Divider, Stack } from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { UtilitiesSection } from "../utilities/UtilitiesSection";
import { useUtilities } from "../../hooks/useUtilities";
import type { Utility } from "../../types/utility";
import { ContractUtilityForm, type ContractUtilityFormHandle } from "./ContractUtilityForm";
import { postContractUtility, getContractUtilitiesByContract } from "../../services/contractUtility.service";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { LoadingButton } from "@mui/lab";
import { useApiErrors } from "../../../shared/hooks/useErrors";

interface Props {
  open: boolean;
  contractId: number;
  onClose: () => void;
  onUpdated?: () => void;
}

export function UtilitiesPickerDialog({ open, contractId, onClose, onUpdated }: Props) {
  const { fetchById } = useUtilities();
  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState<Utility | null>(null);
  const [saving, setSaving] = useState(false);

  const formRef = useRef<ContractUtilityFormHandle>(null);
  const [existingIds, setExistingIds] = useState<Set<number>>(new Set());

  // cargar utilidades ya vinculadas para evitar duplicados
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const list = await getContractUtilitiesByContract(contractId);
        const set = new Set<number>((list || []).map((cu: any) => cu.utilityId));
        setExistingIds(set);
      } catch (e) {
        handleError(e);
        setExistingIds(new Set());
      }
    })();
  }, [open, contractId, handleError]);

  const warnDuplicate = async () => {
    if (typeof alertApi?.warning === "function") {
      await alertApi.warning({
        title: "Servicio ya vinculado",
        description: "Ese servicio ya está asociado a este contrato.",
      });
    }
  };

  const notifySuccess = async (title: string, description?: string) => {
    if (typeof alertApi?.success === "function") {
      await alertApi.success({ title, description, primaryLabel: "Ok" });
    }
  };

  const handleSave = async () => {
    if (!assigning || !formRef.current) return;
    const data = formRef.current.getData();
    if (!(data.initialAmount > 0)) return;
    if (existingIds.has(data.utilityId)) {
      await warnDuplicate();
      // deseleccionar automáticamente si detectamos duplicado al guardar
      setSelectedId(null);
      setAssigning(null);
      return;
    }

    setSaving(true);
    try {
      await postContractUtility(data);
      await notifySuccess("Servicio agregado", "El servicio se vinculó al contrato.");
      onUpdated?.();
      // limpiar selección y cerrar
      setSelectedId(null);
      setAssigning(null);
      onClose();
    } catch (e) {
      handleError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Seleccionar servicios" onClose={onClose} maxWidth="lg">
      <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 3, md: 4 }}>
        <Box flex={1} minWidth={0}>
          <UtilitiesSection
            toggleSelect={async (ids: any) => {
              const arr = (Array.isArray(ids) ? ids : ids != null ? [ids] : []).map((v: any) => Number(v));
              const id = arr.length ? arr[arr.length - 1] : null;

              if (!id) {
                setSelectedId(null);
                setAssigning(null);
                return;
              }

              if (existingIds.has(id)) {
                await warnDuplicate();
                setSelectedId(null);
                setAssigning(null);
                return;
              }

              setSelectedId(id);
              try {
                const u = await fetchById(id);
                setAssigning(u ?? null);
              } catch (e) {
                handleError(e);
                setAssigning(null);
              }
            }}
            isSelected={(id: number | string) => Number(id) === selectedId}
            showActions={true}
            multiSelect={false}
          />
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

        <Box
          flex={{ xs: "none", md: 0.9 }}
          minWidth={{ xs: "100%", md: 360 }}
          display="flex"
          justifyContent="center"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          {assigning && (
            <Stack spacing={2} sx={{ width: "100%", maxWidth: 420, mx: "auto" }}>
              <ContractUtilityForm ref={formRef} utility={assigning} contractId={contractId} />

              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button
                  onClick={() => {
                    setSelectedId(null);
                    setAssigning(null);
                  }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <LoadingButton variant="contained" onClick={handleSave} loading={saving} disabled={saving}>
                  Guardar
                </LoadingButton>
              </Box>
            </Stack>
          )}
        </Box>
      </Stack>
    </Modal>
  );
}
