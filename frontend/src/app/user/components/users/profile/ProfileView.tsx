import { Box, Avatar, Typography, Stack, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { User } from "../../../types/user";
import { LoadingButton } from "@mui/lab";

interface ViewProps {
  user: User;
  editMode: boolean;
  saving: boolean;
  onToggleEdit: () => void;
  onDeleteProfile?: () => void;
}

export function ProfileView({ user, editMode, saving, onToggleEdit, onDeleteProfile }: ViewProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      flexGrow={1}
      width="100%"
      pt={3}
      pb={3}
      sx={{ flex: "1 1 30%", position: "relative" }}
    >
      <Box position="relative">
        <Avatar sx={{ width: 120, height: 120, fontSize: "3rem", bgcolor: "primary.main" }}>
          {user.firstName?.[0]?.toUpperCase()}
          {user.lastName?.[0]?.toUpperCase()}
        </Avatar>
      </Box>
      <Box position="relative" mt={2} textAlign="center">
        <Typography variant="h6" fontWeight="bold" noWrap>
          {user.firstName} {user.lastName}
        </Typography>
        {editMode && (
          <IconButton
            onClick={onDeleteProfile}
            size="small"
            sx={{
              position: "absolute",
              top: "50%",
              left: -30,
              transform: "translateY(-50%)",
              opacity: 0.7,
              color: "error.main",
              "&:hover": {
                opacity: 1,
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        )}
      </Box>
      <Stack spacing={0.5} mt={1} alignItems="center">
        <Typography variant="body2" color="text.secondary" noWrap>
          {user.email}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {user.phone}
        </Typography>
      </Stack>
      <Box mt="1rem" width="100%" display="flex" justifyContent="center">
        <LoadingButton variant="contained" color="primary" onClick={onToggleEdit} loading={saving}>
          {editMode ? "Guardar perfil" : "Editar perfil"}
        </LoadingButton>
      </Box>
    </Box>
  );
}
