import { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { IncreaseForm, IncreaseFormValues } from "../increases/IncreaseForm";
import { postContractIncrease } from "../../services/contractIncrease.service";
import type { Contract } from "../../types/contract";
import { getIncreaseIndexByContract } from "../../services/increaseIndex.service";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { useApiErrors } from "../../../shared/hooks/useErrors";
import { LoadingButton } from "@mui/lab";

interface Props {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
  onSaved: () => void;
}

export const IncreaseDialog = ({ open, contract, onClose, onSaved }: Props) => {
  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  const empty: IncreaseFormValues = {
    date: "",
    amount: "",
    currency: "",
    note: "",
  };
  const [vals, setVals] = useState<IncreaseFormValues>(empty);
  const [saving, setSaving] = useState(false);
  const [indexId, setIndexId] = useState<number | null>(null);

  useEffect(() => {
    setVals(empty);
    setIndexId(null);
    (async () => {
      if (!contract) return;
      const fromContract = (contract as any)?.adjustmentIndex?.id ?? null;
      if (fromContract) {
        setIndexId(Number(fromContract));
        return;
      }
      try {
        const idx = await getIncreaseIndexByContract(contract.id);
        const id = (idx as any)?.id ?? null;
        if (id) setIndexId(Number(id));
      } catch {
        setIndexId(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, open]);

  const hasIndex = indexId != null;
  const isValid =
    Boolean(vals.date) && vals.amount !== "" && Number(vals.amount) > 0 && Boolean(vals.currency) && hasIndex;

  const handleSave = async () => {
    if (!contract || !isValid) return;
    setSaving(true);

    const payload = {
      date: `${vals.date}T00:00:00`,
      amount: Number(vals.amount),
      currency: vals.currency,
      indexId: indexId ?? undefined,
      contractId: contract.id,
      note: vals.note || undefined,
      adjustment:
        (vals as any)?.adjustment === "" || (vals as any)?.adjustment == null ? 0 : Number((vals as any)?.adjustment),
    } as any;

    try {
      await postContractIncrease(payload);
      await alertApi?.success?.({
        title: "Aumento creado con éxito",
        primaryLabel: "Ok",
      });
      onSaved();
    } catch (e) {
      handleError(e); // mostrará el modal de error con el mensaje del backend
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Nuevo Aumento" onClose={onClose}>
      {!hasIndex && (
        <Box sx={{ mb: 1, color: "warning.main", fontSize: ".875rem" }}>
          Asigna un índice de ajuste al contrato antes de registrar un aumento.
        </Box>
      )}
      <IncreaseForm initialValues={vals} onChange={setVals} />
      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <LoadingButton loading={saving} variant="contained" disabled={saving || !isValid} onClick={handleSave}>
          Guardar
        </LoadingButton>
      </Box>
    </Modal>
  );
};
