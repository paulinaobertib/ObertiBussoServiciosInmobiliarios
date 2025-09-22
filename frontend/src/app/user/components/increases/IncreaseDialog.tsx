import { useState, useEffect, useMemo } from "react";
import { Box, Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Modal } from "../../../shared/components/Modal";
import { IncreaseForm, type IncreaseFormValues } from "../increases/IncreaseForm";
import { postContractIncrease } from "../../services/contractIncrease.service";
import { getIncreaseIndexByContract } from "../../services/increaseIndex.service";
import type { Contract } from "../../types/contract";
import type { PaymentCurrency } from "../../types/payment";
import type { ContractIncreaseCreate } from "../../types/contractIncrease";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { useApiErrors } from "../../../shared/hooks/useErrors";

interface Props {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
  onSaved: () => void;
}

export const IncreaseDialog = ({ open, contract, onClose, onSaved }: Props) => {
  const { showAlert } = useGlobalAlert();
  const { handleError } = useApiErrors();

  const [saving, setSaving] = useState(false);
  const [indexId, setIndexId] = useState<number | null>(null);

  const [vals, setVals] = useState<IncreaseFormValues>({
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    currency: (contract?.currency as PaymentCurrency) ?? "",
    adjustment: "",
    note: "",
  });

  // Resolver índice del contrato: primero desde el propio contrato; si no, desde el API
  useEffect(() => {
    if (!open || !contract) {
      setIndexId(null);
      return;
    }
    const fromContract = (contract as any)?.adjustmentIndex?.id ?? null;
    if (fromContract) {
      setIndexId(Number(fromContract));
      return;
    }
    (async () => {
      try {
        const idx = await getIncreaseIndexByContract(contract.id);
        const id = (idx as any)?.id ?? null;
        setIndexId(id ? Number(id) : null);
      } catch {
        setIndexId(null);
      }
    })();
  }, [open, contract]);

  // Validación
  const isValid = useMemo(() => {
    const amountOk = Number(vals.amount) > 0;
    const dateOk = Boolean(vals.date);
    const currencyOk = Boolean(vals.currency);
    const hasIndex = indexId != null;
    return amountOk && dateOk && currencyOk && hasIndex && !!contract?.id;
  }, [vals, indexId, contract?.id]);

  const toApiDateTime = (d: string) => (d && d.includes("T") ? d : `${d}T00:00:00`);

  const handleSave = async () => {
    if (!isValid || !contract?.id || indexId == null) return;
    setSaving(true);
    try {
      const payload: ContractIncreaseCreate = {
        contractId: Number(contract.id),
        date: toApiDateTime(vals.date), // enviar como datetime
        currency: vals.currency as PaymentCurrency,
        amount: Number(vals.amount),
        indexId, // 👈 requerido por el backend
        adjustment: vals.adjustment === "" ? undefined : Number(vals.adjustment),
        note: vals.note?.trim() || undefined,
      };

      await postContractIncrease(payload);

      showAlert("Aumento registrado.", "success");
      onSaved?.();
      onClose();
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuevo aumento">
      {indexId == null && (
        <Box sx={{ mb: 1, color: "warning.main", fontSize: ".875rem" }}>
          Asigná un índice de ajuste al contrato antes de registrar un aumento.
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
