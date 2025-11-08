import { Grid, TextField } from "@mui/material";
import type { User } from "../../../types/user";

interface FormProps {
  user: User;
  editMode: boolean;
  onChange: (field: keyof User, value: string) => void;
}

export function ProfileForm({ user, editMode, onChange }: FormProps) {
  const labels: Partial<Record<keyof User, string>> = {
    userName: "Nombre de usuario",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo electrónico",
    phone: "Teléfono",
  };
  return (
    <Grid container spacing={2} flexGrow={1} p={3} sx={{ flex: "1 1 70%" }}>
      {(["userName", "firstName", "lastName", "email", "phone"] as (keyof User)[]).map((field) => (
        <Grid size={{ xs: 12, sm: field === "userName" ? 12 : 6 }} key={field}>
          <TextField
            label={labels[field] ?? field}
            value={user[field] || ""}
            onChange={(e) => onChange(field, e.target.value)}
            fullWidth
            size="small"
            disabled={!editMode || field === "userName"}
          />
        </Grid>
      ))}
    </Grid>
  );
}
