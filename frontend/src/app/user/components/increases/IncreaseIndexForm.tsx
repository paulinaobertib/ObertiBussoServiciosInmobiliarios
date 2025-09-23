import { useEffect, useMemo, useState } from "react";
import { Box, Grid, TextField, Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import type { IncreaseIndex } from "../../types/increaseIndex";
import { useIncreaseIndexes } from "../../hooks/useIncreaseIndexes";

type Action = "add" | "edit" | "delete";

export interface IncreaseIndexFormProps {
  action?: Action; // si no viene, se infiere por item
  item?: IncreaseIndex | null; // para edición/eliminación
  onDone?: (args: { action: Action; form: { code: string; name: string }; saved?: IncreaseIndex | null }) => void; // callback al terminar (cerrar/refresh desde el padre)
}

type FormState = { code: string; name: string };

const IncreaseIndexForm = ({ action, item, onDone }: IncreaseIndexFormProps) => {
  const mode: Action = action ?? (item?.id ? "edit" : "add");
  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  const { create, update, remove } = useIncreaseIndexes();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({ code: "", name: "" });

  useEffect(() => {
    if (item && (isEdit || isDelete)) {
      setForm({ code: item.code ?? "", name: item.name ?? "" });
    } else {
      setForm({ code: "", name: "" });
    }
  }, [item, isEdit, isDelete]);

  const isValid = useMemo(() => {
    if (isDelete) return true;
    return (form.code || "").trim() !== "" && (form.name || "").trim() !== "";
  }, [form, isDelete]);

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      if (isDelete) {
        if (!item?.id) return;
        const ok = await remove(item.id); // el hook maneja confirmación + alertas
        if (ok) onDone?.({ action: "delete", form });
        return;
      }

      if (isAdd) {
        const created = await create({ code: form.code.trim(), name: form.name.trim() });
        // el hook ya mostró alertas; devolvemos lo creado (si el hook lo encontró)
        onDone?.({ action: "add", form, saved: created ?? undefined });
        return;
      }

      if (isEdit && item?.id) {
        const ok = await update({ id: item.id, code: form.code.trim(), name: form.name.trim() });
        if (ok) onDone?.({ action: "edit", form, saved: { id: item.id, ...form } as IncreaseIndex });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {/* Campos: en delete los dejamos deshabilitados para mantener el diseño */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Código"
            fullWidth
            size="small"
            value={form.code}
            onChange={handleChange("code")}
            disabled={isDelete}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Nombre"
            fullWidth
            size="small"
            value={form.name}
            onChange={handleChange("name")}
            disabled={isDelete}
          />
        </Grid>
      </Grid>

      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
        {/* El botón de cerrar/cancelar lo maneja el contenedor (Modal/Dialog) */}
        <LoadingButton
          onClick={handleSubmit}
          loading={saving}
          disabled={!isValid || saving}
          variant="contained"
          color={isDelete ? "error" : "primary"}
        >
          {isDelete ? "Eliminar" : isEdit ? "Guardar" : "Confirmar"}
        </LoadingButton>
        <Button onClick={() => onDone?.({ action: mode, form })} disabled={saving} sx={{ display: "none" }}>
          HiddenClose // (placeholder para mantener layout si lo necesitás)
        </Button>
      </Box>
    </Box>
  );
};

export default IncreaseIndexForm;
