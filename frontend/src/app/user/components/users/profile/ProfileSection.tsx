import { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Collapse, Button, Card } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useProfile } from "../../../hooks/useProfile";
import { ProfileView } from "./ProfileView";
import { ProfileForm } from "./ProfileForm";
import type { User } from "../../../types/user";
import { useConfirmDialog } from "../../../../shared/components/ConfirmDialog";
import { deleteUser } from "../../../services/user.service";
import { useAuthContext } from "../../../context/AuthContext";

export function ProfileSection() {
  const { profile, loading, updateProfile } = useProfile();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(true);
  const initialized = useRef(false);
  const { ask, DialogUI } = useConfirmDialog();
  const { logout, setInfo, info } = useAuthContext();

  // Sincroniza el formulario con el perfil cargado.
  // - Al inicio, carga el perfil en el form.
  // - Si el perfil cambia y NO estamos editando, refleja el cambio en el form.
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
      const merged = await updateProfile(form);
      setForm((prev) => (prev ? { ...prev, ...merged } : merged));
      setSaving(false);
    }
    setEditMode((prev) => !prev);
  };

  const handleChange = (field: keyof User, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const userData = form ?? profile;

  const handleDeleteProfile = () => {
    ask(
      <>
        <b>¿Seguro que quieres eliminar tu cuenta?</b>
        <br />
        Esta acción es irreversible.
      </>,
      async () => {
        try {
          if (!info) {
            alert("No hay información de usuario. No puedes eliminar el perfil.");
            return;
          }
          await deleteUser(info.id); // Asegurate que deleteUser es una función

          // Limpiar sesión/contexto
          setInfo(null);
          sessionStorage.clear();
          localStorage.clear();
          logout();
        } catch (err) {
          // Si usás Axios, esto es lo más seguro:
          if (typeof err === "object" && err !== null && "response" in err && (err as any).response?.data) {
            alert(`Error: ${(err as any).response.data}`);
          } else {
            alert("Error al eliminar la cuenta. Intenta de nuevo.");
          }
        }
      }
    );
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
      {DialogUI}
    </Card>
  );
}
