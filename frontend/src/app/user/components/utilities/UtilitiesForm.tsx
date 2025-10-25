import { useState, useMemo } from "react";
import { TextField, Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import type { Utility } from "../../types/utility";
import { postUtility, putUtility, deleteUtility } from "../../services/utility.service";
import { useGlobalAlert } from "../../../shared/context/AlertContext";

interface Props {
  action: "add" | "edit" | "delete";
  item?: Utility;
  onDone: (info: { action: "add" | "edit" | "delete"; form: Utility }) => void;
}

export const UtilitiesForm = ({ action, item, onDone }: Props) => {
  const { showAlert } = useGlobalAlert();

  const [form, setForm] = useState<Utility>({
    id: item?.id ?? 0,
    name: item?.name ?? "",
  });
  const [loading, setLoading] = useState(false);

  const isDelete = action === "delete";
  const isAdd = action === "add";
  const isEdit = action === "edit";

  const invalid = useMemo(() => {
    if (isDelete) return false;
    return !form.name.trim();
  }, [form, isDelete]);

  const submit = async () => {
    if (invalid) return;
    setLoading(true);
    try {
      if (isAdd) {
        const payload: Utility = { id: 0, name: form.name.trim() };
        await postUtility(payload);
        showAlert("Servicio creado", "success");
        onDone({ action, form: payload });
      } else if (isEdit) {
        const payload: Utility = { id: form.id, name: form.name.trim() };
        await putUtility(payload);
        showAlert("Servicio actualizado", "success");
        onDone({ action, form: payload });
      } else if (isDelete) {
        await deleteUtility(form.id);
        showAlert("Servicio eliminado", "success");
        onDone({ action, form });
      }
    } catch (e: any) {
      console.error(e);
      showAlert(e?.message ?? "Error al guardar servicio", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
