import { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { UtilityIncreaseForm, type UtilityIncreaseFormValues } from "./UtilityIncreaseForm";
import { postContractUtilityIncrease } from "../../services/contractUtilityIncrease.service";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { LoadingButton } from "@mui/lab";

interface Props {
  open: boolean;
  contractUtilityId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ContractUtilityIncreaseDialog({ open, contractUtilityId, onClose, onSaved }: Props) {
  const { showAlert } = useGlobalAlert();
  const empty: UtilityIncreaseFormValues = {
    adjustmentDate: "",
    amount: "",
  };
  const [vals, setVals] = useState<UtilityIncreaseFormValues>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setVals(empty);
  }, [open]);

  const isValid = Boolean(vals.adjustmentDate) && vals.amount !== "" && Number(vals.amount) > 0 && contractUtilityId != null;

  const handleSave = async () => {
    if (!isValid || contractUtilityId == null) return;
    setSaving(true);
    try {
      await postContractUtilityIncrease({
        adjustmentDate: vals.adjustmentDate,
        amount: Number(vals.amount),
        contractUtilityId: Number(contractUtilityId),
      } as any);
      showAlert("Aumento de servicio creado con éxito", "success");
      onSaved();
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? "Error al crear aumento de servicio";
      console.error("Error creating contract utility increase:", e);
      showAlert(String(msg), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Nuevo Aumento de Servicio" onClose={onClose}>
      <UtilityIncreaseForm initialValues={vals} onChange={setVals} />
      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <LoadingButton variant="contained" loading={saving} disabled={saving || !isValid} onClick={handleSave}>
          Confirmar
        </LoadingButton>
      </Box>
    </Modal>
  );
}

