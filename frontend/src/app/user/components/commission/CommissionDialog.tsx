import { useState, useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { CommissionForm, CommissionFormHandle } from "./CommissionForm";
import { LoadingButton } from "@mui/lab";

interface Props {
  open: boolean;
  contractId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export const CommissionDialog = ({ open, contractId, onClose, onSaved }: Props) => {
  const [saving, setSaving] = useState(false);
  const formRef = useRef<CommissionFormHandle>(null);

  useEffect(() => {
    setSaving(false);
  }, [open]);

  const handleSave = async () => {
    if (!formRef.current) return;
    setSaving(true);
    const ok = await formRef.current.submit();
    setSaving(false);
    if (ok) {
      onSaved();
      onClose();
    }
  };

  return (
    <Modal open={open} title="Registrar Comisión Inmobiliaria" onClose={onClose}>
      <CommissionForm ref={formRef} action="add" contractId={contractId ?? undefined} onSuccess={undefined} />
      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" onClick={handleSave} loading={saving} disabled={saving}>
          Guardar
        </LoadingButton>
      </Box>
    </Modal>
  );
};
