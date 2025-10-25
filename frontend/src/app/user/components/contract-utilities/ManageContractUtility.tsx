import { useEffect, useRef, useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { ContractUtilityForm, type ContractUtilityFormHandle } from "./ContractUtilityForm";
import {
  getContractUtilityById,
  postContractUtility,
  putContractUtility,
} from "../../services/contractUtility.service";
import type { ContractUtilityGet } from "../../types/contractUtility";
import { useUtilities } from "../../hooks/useUtilities";
import type { Utility } from "../../types/utility";

type Mode = "add" | "edit";

interface Props {
  open: boolean;
  mode: Mode;
  contractId: number;
  utility?: Utility | null;
  contractUtilityId?: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ContractUtilityDialog({ open, mode, contractId, utility, contractUtilityId, onClose, onSaved }: Props) {
  const formRef = useRef<ContractUtilityFormHandle>(null);
  const { fetchById } = useUtilities();
  const [loading, setLoading] = useState(false);
  const [util, setUtil] = useState<Utility | null>(utility ?? null);
  const [initial, setInitial] = useState<ContractUtilityGet | null>(null);

  // Load for edit
  useEffect(() => {
    (async () => {
      if (!open) return;
      if (mode === "edit" && contractUtilityId) {
        setLoading(true);
        try {
          const cu = await getContractUtilityById(contractUtilityId);
          setInitial(cu as any);
          const u = await fetchById((cu as any).utilityId);
          setUtil(u as any);
        } finally {
          setLoading(false);
        }
      } else if (mode === "add") {
        setInitial(null);
        setUtil(utility ?? null);
      }
    })();
  }, [open, mode, contractUtilityId, utility]);

  const handleSave = async () => {
    if (!formRef.current) return;
    const data = formRef.current.getData();
    if (!(data.initialAmount > 0)) return;
    setLoading(true);
    try {
      if (mode === "add") {
        await postContractUtility(data);
      } else if (initial) {
        await putContractUtility({
          id: initial.id as any,
          periodicity: data.periodicity,
          initialAmount: data.initialAmount as any,
          lastPaidAmount: data.lastPaidAmount as any,
          lastPaidDate: data.lastPaidDate as any,
          notes: data.notes,
          contractId: data.contractId as any,
          utilityId: data.utilityId as any,
        } as any);
      }
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  };
  const title =
    mode === "add"
      ? util
        ? `Asignar: ${util.name}`
        : "Asignar servicio"
      : util
      ? `Editar valores iniciales de ${util.name}`
      : "Editar servicio del contrato";

  const isLoading = mode === "edit" && (loading || !initial || !util);

  return (
    <Modal open={open} title={title} onClose={onClose}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {util && (
            <ContractUtilityForm
              ref={formRef}
              utility={util}
              contractId={contractId}
              initial={mode === "edit" ? (initial as any) : undefined}
            />
          )}
          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={loading || !util}>
              Guardar
            </Button>
          </Box>
        </>
      )}
    </Modal>
  );
}
