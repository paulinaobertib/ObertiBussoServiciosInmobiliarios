import { useEffect, useRef, useState, useCallback } from "react";
import { Box, CircularProgress, Collapse, Button, Card } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useProfile } from "../../../hooks/useProfile";
import { ProfileView } from "./ProfileView";
import { ProfileForm } from "./ProfileForm";
import type { User } from "../../../types/user";
import { deleteUser } from "../../../services/user.service";
import { useAuthContext } from "../../../context/AuthContext";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";
import { useApiErrors } from "../../../../shared/hooks/useErrors";

export function ProfileSection() {
  const { profile, loading, updateProfile } = useProfile();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(true);
  const initialized = useRef(false);

  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();
  const { logout, setInfo, info } = useAuthContext();

  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Ok" });
      }
    },
    [alertApi]
  );

  const confirmDanger = useCallback(async () => {
    if (typeof alertApi?.doubleConfirm === "function") {
      return await alertApi.doubleConfirm({
        kind: "error",
        title: "ESTAS POR ELIMINAR TU CUENTA",
        description: "ESTA ACCIÓN ES IRREVERSIBLE",
        step2Title: "¿ESTÁS 100% SEGURO?",
        step2Description: "Es la última oportunidad, es irreversible",
        primaryLabel: "Borrar mi Cuenta",
        secondaryLabel: "Cancelar Borrado",
        swapOnSecond: true,
      });
    }
  }, [alertApi]);

  // Sincroniza el formulario con el perfil cargado.
  useEffect(() => {
    if (!profile) return;
    if (!initialized.current) {
      setForm(profile);
      initialized.current = true;
      return;
    }
    if (!editMode) {
      setForm(profile);
    }
  }, [profile, editMode]);

  const handleToggleEdit = async () => {
    if (editMode && form) {
      setSaving(true);
      try {
        const merged = await updateProfile(form);
        setForm((prev) => (prev ? { ...prev, ...merged } : merged));
        await notifySuccess("Perfil actualizado");
      } catch (e) {
        handleError(e);
      } finally {
        setSaving(false);
      }
    }
    setEditMode((prev) => !prev);
  };

  const handleChange = (field: keyof User, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const userData = form ?? profile;

  const handleDeleteProfile = async () => {
    const ok = await confirmDanger();
    if (!ok) return;

    try {
      if (!info) {
        handleError(new Error("No hay información de usuario. No puedes eliminar el perfil."));
        return;
      }
      await deleteUser(info.id);

      // Limpiar sesión/contexto
      setInfo(null);
      sessionStorage.clear();
      localStorage.clear();
      await notifySuccess("Cuenta eliminada");
      logout();
    } catch (err) {
      handleError(err);
    }
  };

  // If collapsed, show small bar
  if (!open) {
    return (
      <Box display="flex" justifyContent="center" p={1}>
        <Button size="small" onClick={() => setOpen(true)} startIcon={<ExpandMoreIcon />}>
          Mostrar perfil
        </Button>
      </Box>
    );
  }

  return (
    <Card>
      {/* Collapse control */}
      <Box display="flex" justifyContent="center" mt={1}>
        <Button size="small" onClick={() => setOpen(false)} startIcon={<ExpandLessIcon />}>
          Ocultar perfil
        </Button>
      </Box>

      {/* Content */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        {loading && !userData ? (
          <Box textAlign="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            alignItems="center"
            justifyContent="center"
            width="100%"
            gap={4}
          >
            <ProfileView
              user={userData as User}
              editMode={editMode}
              saving={saving}
              onToggleEdit={handleToggleEdit}
              onDeleteProfile={handleDeleteProfile}
            />
            <ProfileForm user={userData as User} editMode={editMode} onChange={handleChange} />
          </Box>
        )}
      </Collapse>
    </Card>
  );
}
