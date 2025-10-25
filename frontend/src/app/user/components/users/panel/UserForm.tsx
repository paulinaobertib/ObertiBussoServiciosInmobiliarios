import { useState, useEffect, ChangeEvent } from "react";
import { Box, TextField, Grid } from "@mui/material";
import { useAuthContext } from "../../../context/AuthContext";
import { postUser, putUser, deleteUser } from "../../../services/user.service";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";
import type { User, UserCreate } from "../../../types/user";
import { LoadingButton } from "@mui/lab";
import { useApiErrors } from "../../../../shared/hooks/useErrors";

type Action = "add" | "edit" | "delete";

export interface UserFormProps {
  action?: Action;
  item?: User;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const UserForm = ({ action = "add", item, onSuccess, onClose }: UserFormProps) => {
  const { info } = useAuthContext(); // si no lo usás, podés removerlo
  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  const isAdd = action === "add";
  const isEdit = action === "edit";
  const isDelete = action === "delete";

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    id?: string | number;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  }>({
    id: item?.id ?? "",
    userName: item?.userName ?? "",
    email: item?.email ?? "",
    firstName: item?.firstName ?? "",
    lastName: item?.lastName ?? "",
    phone: item?.phone ?? "",
  });

  useEffect(() => {
    if (item) {
      setForm({
        id: item.id,
        userName: item.userName ?? "",
        email: item.email ?? "",
        firstName: item.firstName ?? "",
        lastName: item.lastName ?? "",
        phone: item.phone ?? "",
      });
    } else {
      setForm({
        id: undefined,
        userName: "",
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
      });
    }
  }, [action, info, item]);

  const handleChange = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // -------- Validaciones simples --------
  const userNameValid = form.userName.trim().length >= 3;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const phoneDigits = form.phone.replace(/\D+/g, "");
  const phoneValid = phoneDigits.length >= 10 && phoneDigits.length <= 15;

  const requiredOk =
    (isDelete ? true : form.userName.trim() !== "" && form.email.trim() !== "") &&
    (isDelete ? true : userNameValid && emailValid && phoneValid);

  const formValid = requiredOk;

  // -------- Helpers de alerta --------
  const notifySuccess = async (title: string, description?: string) => {
    if (alertApi?.success) {
      await alertApi.success({
        title,
        description: description ?? "Acción ejecutada con éxito",
        primaryLabel: "Volver",
        primaryProps: { "data-testid": "btn-volver" }, 
      });
    } else if (alertApi?.showAlert) {
      alertApi.showAlert(description ?? title, "success");
    }
  };

  const warn = async (message: string) => {
    if (alertApi?.warning) {
      await alertApi.warning({ title: "Atención", description: message, primaryLabel: "Entendido" });
    } else if (alertApi?.showAlert) {
      alertApi.showAlert(message, "warning");
    }
  };

  // -------- Submit con confirmaciones --------
  const handleSubmit = async () => {
    // Validaciones para creación/edición
    if (!isDelete) {
      if (!userNameValid) {
        await warn("Username debe tener al menos 3 caracteres");
        return;
      }
      if (!emailValid) {
        await warn("Email inválido");
        return;
      }
      if (!phoneValid) {
        await warn("Teléfono debe tener entre 10 y 15 dígitos");
        return;
      }
    }

    // Doble confirmación para eliminar
    if (isDelete && form.id != null) {
      let ok = true;
      if (typeof alertApi?.doubleConfirm === "function") {
        ok = await alertApi.doubleConfirm({
          kind: "error",
          description: "¿Vas a eliminar a este usuario definitivamente?",
        });
        if (!ok) return;
      }
    }

    setSaving(true);
    try {
      if (isAdd) {
        const body: UserCreate = {
          userName: form.userName,
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        };
        await postUser(body);
        await notifySuccess("Usuario creado");
      } else if (isDelete && form.id != null) {
        const id = String(form.id); // normaliza a string
        await deleteUser(id);
        await notifySuccess("Usuario eliminado");
      } else {
        await putUser(form as unknown as User);
        await notifySuccess("Usuario actualizado");
      }
      onSuccess?.();
      onClose?.();
    } catch (e) {
      handleError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" },
      }}
    >
      {/* Campos del formulario */}
      <Grid container spacing={2}>
        {/* Username */}
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Nombre de usuario"
            name="username" 
            value={form.userName}
            onChange={handleChange("userName")}
            fullWidth
            disabled={isDelete || isEdit}
            error={!isDelete && form.userName !== "" && !userNameValid}
            inputProps={{ "data-testid": "input-username" }}
          />
        </Grid>

        {/* Email */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange("email")}
            fullWidth
            disabled={isDelete}
            error={!isDelete && form.email !== "" && !emailValid}
            inputProps={{ "data-testid": "input-email" }}
          />
        </Grid>

        {/* Nombre */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Nombre"
            name="firstName"
            value={form.firstName}
            onChange={handleChange("firstName")}
            fullWidth
            disabled={isDelete}
            inputProps={{ "data-testid": "input-firstName" }}
          />
        </Grid>

        {/* Apellido */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Apellido"
            name="lastName"
            value={form.lastName}
            onChange={handleChange("lastName")}
            fullWidth
            disabled={isDelete}
            inputProps={{ "data-testid": "input-lastName" }}
          />
        </Grid>

        {/* Teléfono */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Teléfono"
            name="phone"
            value={form.phone}
            onChange={handleChange("phone")}
            fullWidth
            disabled={isDelete}
            error={!isDelete && form.phone !== "" && !phoneValid}
            inputProps={{ "data-testid": "input-phone" }}
          />
        </Grid>

        {/* Acción */}
        <Grid size={{ xs: 12 }}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            {onClose && (
              <LoadingButton onClick={onClose} loading={false} variant="outlined">
                Cancelar
              </LoadingButton>
            )}
            <LoadingButton
              variant="contained"
              onClick={handleSubmit}
              loading={saving}
              disabled={saving || !formValid}
              color={isDelete ? "error" : "primary"}
            >
              {isAdd ? "Crear usuario" : isEdit ? "Guardar cambios" : "Eliminar usuario"}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserForm;
