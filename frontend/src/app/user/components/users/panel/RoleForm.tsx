import { useState, useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Autocomplete, TextField } from "@mui/material";
import type { Role } from "../../../types/user";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";
import { useApiErrors } from "../../../../shared/hooks/useErrors";
import { addRoleToUser, deleteRoleFromUser, getRoles } from "../../../services/user.service";

const AVAILABLE_ROLES: { label: string; value: Role }[] = [
  { label: "Administrador", value: "admin" },
  { label: "Usuario", value: "user" },
  { label: "Inquilino", value: "tenant" },
];

export interface RoleFormProps {
  userId: string;
  currentRoles: Role[];
  onSuccess: () => void;
  onClose: () => void;
}

export const RoleForm = ({ userId, currentRoles, onSuccess, onClose }: RoleFormProps) => {
  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  const [selected, setSelected] = useState<Role[]>([]);
  const [initial, setInitial] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  /* -------- helpers de alertas (solo éxito/warning aquí) -------- */
  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Ok" });
      }
    },
    [alertApi]
  );

  const notifyWarning = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.warning === "function") {
        await alertApi.warning({ title, description, primaryLabel: "Entendido" });
      }
    },
    [alertApi]
  );

  // Inicializa roles
  useEffect(() => {
    if (currentRoles.length) {
      setSelected(currentRoles);
      setInitial(currentRoles);
    } else {
      setLoading(true);
      getRoles(userId)
        .then((res) => {
          setSelected(res.data);
          setInitial(res.data);
        })
        .catch((err) => {
          // delega alerta/transformación al hook centralizado
          handleError(err);
          setSelected([]);
          setInitial([]);
        })
        .finally(() => setLoading(false));
    }
  }, [userId, currentRoles, handleError]);

  const handleSave = async () => {
    if (!selected.length) {
      await notifyWarning("Debe asignar al menos un rol");
      return;
    }
    setLoading(true);
    try {
      const toAdd = selected.filter((r) => !initial.includes(r));
      const toRemove = initial.filter((r) => !selected.includes(r));
      await Promise.all([
        ...toAdd.map((r) => addRoleToUser(userId, r)),
        ...toRemove.map((r) => deleteRoleFromUser(userId, r)),
      ]);
      await notifySuccess("Roles actualizados con éxito");
      onSuccess();
      onClose();
    } catch (err) {
      // errores pasan por el manejador global (muestra alerta)
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = selected.length !== initial.length || !selected.every((r) => initial.includes(r));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="subtitle1" fontWeight={600}>
        Selecciona roles:
      </Typography>
      <Autocomplete
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        multiple
        options={AVAILABLE_ROLES}
        getOptionLabel={(o) => o.label}
        value={AVAILABLE_ROLES.filter((o) => selected.includes(o.value))}
        onChange={(_, vs) => setSelected(vs.map((o) => o.value))}
        disableCloseOnSelect
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size="small"
            helperText={!selected.length && "Debe elegir al menos un rol"}
          />
        )}
      />

      <LoadingButton variant="contained" onClick={handleSave} loading={loading} disabled={!hasChanges}>
        Guardar roles
      </LoadingButton>
    </Box>
  );
};
