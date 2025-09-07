import { useState, useEffect, ChangeEvent } from "react";
import { Box, TextField, Grid } from "@mui/material";
import { postGuarantor, putGuarantor, deleteGuarantor } from "../../services/guarantor.service";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import type { Guarantor, GuarantorCreate } from "../../types/guarantor";
import { LoadingButton } from "@mui/lab";

type Action = "add" | "edit" | "delete";

export interface Props {
  action?: Action;
  item?: Guarantor;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const GuarantorForm = ({ action, item, onSuccess, onClose }: Props) => {
  const { showAlert } = useGlobalAlert();

  const isAdd = action === "add";
  const isEdit = action === "edit";
  const isDelete = action === "delete";

  // inicializo el form según el modo
  const [form, setForm] = useState<GuarantorCreate & Pick<Guarantor, "id">>({
    id: item?.id ?? "",
    name: item?.name ?? "",
    email: item?.email ?? "",
    phone: item?.phone ?? "",
  } as any);

  const [saving, setSaving] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneValid = /^[0-9]{10,15}$/.test(form.phone.trim());
  const formValid = isAdd ? emailValid && phoneValid : true;

  // si es edición, cargo datos al montar
  useEffect(() => {
    if (isEdit && item) {
      setForm({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone ?? "",
      });
    }
  }, [action, item]);

  const handleChange = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    // si es creación, chequeo antes
    if (isAdd) {
      if (!emailValid) {
        showAlert("Email inválido", "warning");
        return;
      }
      if (!phoneValid) {
        showAlert("Teléfono debe tener entre 10 y 15 dígitos", "warning");
        return;
      }
    }
    setSaving(true);
    try {
      if (isAdd) {
        const body: GuarantorCreate = {
          name: form.name,
          email: form.email,
          phone: form.phone,
        };

        await postGuarantor(body);
        showAlert("Garante creado con éxito", "success");
      } else if (isDelete && form.id) {
        await deleteGuarantor(form.id);
        showAlert("Garante eliminado con éxito", "success");
      } else {
        await putGuarantor(form.id, form as Guarantor);
        showAlert("Usuario actualizado con éxito", "success");
      }
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      showAlert(err.response?.data ?? "Error desconocido", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        alignItems: { xs: "stretch", md: "center" },
      }}
    >
      {/* Campos del formulario */}
      <Grid container spacing={2} flexGrow={1}>
        {/* Username */}
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Nombre"
            value={form.name}
            fullWidth
            disabled={isDelete}
            size="small"
            onChange={handleChange("name")}
          />
        </Grid>
        {/* Email y Teléfono */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Correo electrónico"
            value={form.email}
            onChange={handleChange("email")}
            fullWidth
            size="small"
            disabled={isDelete}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Teléfono"
            value={form.phone}
            onChange={handleChange("phone")}
            fullWidth
            size="small"
            disabled={isDelete}
          />
        </Grid>
        {/* Botones */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <LoadingButton
              variant="contained"
              onClick={handleSubmit}
              loading={saving}
              disabled={saving || !formValid}
              color={isDelete ? "error" : "primary"}
            >
              {isAdd ? "Crear garante" : isEdit ? "Guardar cambios" : "Eliminar garante"}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
