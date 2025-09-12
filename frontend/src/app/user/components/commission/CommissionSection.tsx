import { useRef, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { CommissionForm, type CommissionFormHandle } from "./CommissionForm";

interface Props {
  contractId: number;
  onSaved: () => void;
}

export function CommissionInlineStep({ contractId, onSaved }: Props) {
  const formRef = useRef<CommissionFormHandle>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formRef.current) return;
    setSaving(true);
    const ok = await formRef.current.submit();
    setSaving(false);
    if (ok) onSaved();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="subtitle1" fontWeight={700}>
        Registrar Comisión Inmobiliaria
      </Typography>
      <CommissionForm ref={formRef} action="add" contractId={contractId} />
      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : "Guardar comisión"}
        </Button>
      </Box>
    </Box>
  );
}

