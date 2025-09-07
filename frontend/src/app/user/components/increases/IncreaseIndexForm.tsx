import { useState, useMemo } from "react";
import { TextField, Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import type { IncreaseIndex } from "../../types/increaseIndex";
import { postIncreaseIndex, putIncreaseIndex, deleteIncreaseIndex } from "../../services/increaseIndex.service";
import { useGlobalAlert } from "../../../shared/context/AlertContext";

interface Props {
  action: "add" | "edit" | "delete";
  item?: IncreaseIndex;
  onDone: (info: { action: "add" | "edit" | "delete"; form: IncreaseIndex }) => void;
}

export const IncreaseIndexForm = ({ action, item, onDone }: Props) => {
  const { showAlert } = useGlobalAlert();

  const [form, setForm] = useState<IncreaseIndex>({
    id: item?.id ?? 0,
    code: item?.code ?? "",
    name: item?.name ?? "",
  });
  const [loading, setLoading] = useState(false);

  const isDelete = action === "delete";
  const isAdd = action === "add";
  const isEdit = action === "edit";

  const invalid = useMemo(() => {
    if (isDelete) return false;
    return !form.code.trim() || !form.name.trim();
  }, [form, isDelete]);

  const submit = async () => {
    if (invalid) return;
    setLoading(true);
    try {
      if (isAdd) {
        const payload = { code: form.code, name: form.name };
        console.log("[IncreaseIndexForm] ADD payload (sin id):", payload);
        await postIncreaseIndex(payload);
        showAlert("Índice creado", "success");
        onDone({ action, form: { id: 0, ...payload } as IncreaseIndex });
      } else if (isEdit) {
        const payload = { id: form.id, code: form.code.trim(), name: form.name.trim() };
        console.log("[IncreaseIndexForm] EDIT payload:", payload);
        await putIncreaseIndex(payload);
        showAlert("Índice actualizado", "success");
        onDone({ action, form: payload as IncreaseIndex });
      } else if (isDelete) {
        console.log("[IncreaseIndexForm] DELETE id:", form.id);
        await deleteIncreaseIndex(form.id);
        showAlert("Índice eliminado", "success");
        onDone({ action, form });
      }
    } catch (e: any) {
      console.error(e);
      showAlert(e?.message ?? "Error al guardar índice", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TextField
        fullWidth
        label="Código"
        value={form.code}
        onChange={(e) => setForm({ ...form, code: e.target.value })}
        disabled={isDelete || loading}
        sx={{ mb: 2 }}
        size="small"
      />

      <TextField
        fullWidth
        label="Nombre"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        disabled={isDelete || loading}
        sx={{ mb: 2 }}
        size="small"
      />

      <Box textAlign="right">
        <LoadingButton
          onClick={submit}
          loading={loading}
          disabled={invalid || loading}
          variant="contained"
          color={isDelete ? "error" : "primary"}
        >
          {isDelete ? "Eliminar" : "Confirmar"}
        </LoadingButton>
      </Box>
    </>
  );
};
