import { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { UtilityIncreaseForm, type UtilityIncreaseFormValues } from "./UtilityIncreaseForm";
import { LoadingButton } from "@mui/lab";
import { useContractUtilityIncreases } from "../../hooks/contracts/useContractUtilityIncreases";

interface Props {
  open: boolean;
  contractUtilityId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ContractUtilityIncreaseDialog({ open, contractUtilityId, onClose, onSaved }: Props) {
  const empty: UtilityIncreaseFormValues = {
    adjustmentDate: "",
    amount: "",
  };
  const [vals, setVals] = useState<UtilityIncreaseFormValues>(empty);

  // usamos el hook centralizado (maneja alerts/confirm internamente)
  const { createIncrease, saving } = useContractUtilityIncreases(contractUtilityId ?? null);

  useEffect(() => {
    if (open) setVals(empty);
  }, [open]);

  const isValid =
    Boolean(vals.adjustmentDate) && vals.amount !== "" && Number(vals.amount) > 0 && contractUtilityId != null;

  const handleSave = async () => {
    if (!isValid || contractUtilityId == null) return;

    const created = await createIncrease({
      contractUtilityId: Number(contractUtilityId),
      adjustmentDate: vals.adjustmentDate,
      amount: Number(vals.amount),
    } as any);

    if (created) {
      onSaved(); // el hook ya mostró el success
    }
  };

  return (
    <Modal open={open} title="Nuevo Aumento de Servicio" onClose={onClose}>
      <UtilityIncreaseForm initialValues={vals} onChange={setVals} />
      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={saving} disabled={saving || !isValid} onClick={handleSave}>
          Confirmar
        </LoadingButton>
      </Box>
    </Modal>
  );
}
