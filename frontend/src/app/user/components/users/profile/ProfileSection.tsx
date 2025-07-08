// src/app/user/components/ProfileSection.tsx
import { useRef, useState, useEffect } from "react";
import {
  Accordion, AccordionSummary, AccordionDetails,
  Box, CircularProgress, Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useProfile } from "../../../hooks/useProfile";
import { ProfileView } from "./ProfileView";
import { ProfileForm } from "./ProfileForm";
import type { User } from "../../../types/user";

export function ProfileSection() {
  const { profile, loading, error, updateProfile } = useProfile();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm]         = useState<User | null>(null);
  const [saving, setSaving]     = useState(false);
  const initialized             = useRef(false);

  /* copiar perfil una sola vez (primera carga) */
  useEffect(() => {
    if (profile && !initialized.current) {
      setForm(profile);
      initialized.current = true;
    }
  }, [profile]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const merged = await updateProfile(form);       // ← devuelve la mezcla
      // solo actualizamos los campos que llegaron
      setForm(prev => (prev ? { ...prev, ...merged } : merged));
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const userData = form ?? profile;                   // nunca null tras init

  return (
    <Accordion disableGutters defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
          Mis Datos
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        {loading && !userData && (
          <Box textAlign="center" my={4}><CircularProgress/></Box>
        )}
        {error && !userData && (
          <Box textAlign="center" my={4}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {userData && (
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            justifyContent="center"
            alignItems="center"
            gap={4}
            width="100%"
          >
            <Box flexShrink={0}>
              <ProfileView
                user={userData}
                editMode={editMode}
                saving={saving}
                onEdit={() => setEditMode(true)}
                onSave={handleSave}
              />
            </Box>

            <Box flexGrow={1} maxWidth={{ md: 500 }} width="100%">
              <ProfileForm
                form={userData}
                editMode={editMode}
                onChange={(field, value) =>
                  setForm(prev =>
                    prev ? { ...prev, [field]: value } : prev
                  )
                }
              />
            </Box>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
