// src/app/user/components/users/ProfileView.tsx

import { Avatar, Typography, Button, Stack } from "@mui/material";
import type { User } from "../../types/user";

interface Props {
  user: User;
  editMode: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => Promise<void>;
}

export const ProfileView = ({
  user,
  editMode,
  saving,
  onEdit,
  onSave,
}: Props) => (
  <Stack spacing={1} alignItems="center" sx={{ width: 280 }}>
    <Avatar sx={{ width: 80, height: 80 }}>
      {user.firstName[0]?.toUpperCase()}
    </Avatar>
    <Typography variant="h6">
      {user.firstName} {user.lastName}
    </Typography>
    <Typography color="text.secondary">{user.email}</Typography>

    <Button
      variant="contained"
      color="secondary"
      onClick={editMode ? onSave : onEdit}
      disabled={saving}
    >
      {editMode ? "Guardar cambios" : "Editar datos"}
    </Button>
  </Stack>
);
