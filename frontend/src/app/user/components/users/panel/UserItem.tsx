// src/app/shared/components/UserItem.tsx
import { Box, Typography, IconButton, Tooltip, useTheme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import type { User, Role } from "../../../types/user";

interface UserItemProps {
  user: User & { roles: Role[] };
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
  onRoles: (u: User) => void;
}

export const UserItem = ({
  user,
  onEdit,
  onDelete,
  onRoles,
}: UserItemProps) => {
  const theme = useTheme();
  const gridTemplate = "1fr 1fr 1fr 1fr 75px";
  const cellSx = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } as const;

  // datos para mobile con labels
  const mobileFields = [
    { label: "Nombre completo", value: `${user.firstName} ${user.lastName}` },
    { label: "Email", value: user.email },
    { label: "Teléfono", value: user.phone },
    { label: "Roles", value: user.roles.join(", ") || "—" },
  ];

  return (
    <Box
      sx={{
        display: { xs: "block", sm: "grid" },
        gridTemplateColumns: gridTemplate,
        alignItems: "center",
        py: 1,
        mb: 0.5,
        bgcolor: "transparent",
        cursor: "pointer",
        "&:hover": { bgcolor: theme.palette.action.hover },
      }}
    >
      {/* ===== MOBILE ===== */}
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        {mobileFields.map((f) => (
          <Box key={f.label} sx={{ display: "flex", gap: 1, mb: 0.5 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {f.label}:
            </Typography>
            <Tooltip title={f.value} arrow>
              <Typography
                variant="body2"
                noWrap
                sx={cellSx}
              >
                {f.value}
              </Typography>
            </Tooltip>
          </Box>
        ))}
      </Box>

      {/* ===== DESKTOP ===== */}
      <Tooltip title={`${user.firstName} ${user.lastName}`} arrow>
        <Typography
          variant="body2"
          sx={{ ...cellSx, display: { xs: "none", sm: "block" } }}
        >
          {user.firstName} {user.lastName}
        </Typography>
      </Tooltip>

      <Tooltip title={user.email} arrow>
        <Typography
          variant="body2"
          sx={{ ...cellSx, display: { xs: "none", sm: "block" } }}
        >
          {user.email}
        </Typography>
      </Tooltip>

      <Tooltip title={user.phone} arrow>
        <Typography
          variant="body2"
          sx={{ ...cellSx, display: { xs: "none", sm: "block" } }}
        >
          {user.phone}
        </Typography>
      </Tooltip>

      <Tooltip title={user.roles.join(", ") || "—"} arrow>
        <Typography
          variant="body2"
          sx={{ ...cellSx, display: { xs: "none", sm: "block" } }}
        >
          {user.roles.join(", ") || "—"}
        </Typography>
      </Tooltip>

      {/* ===== ACCIONES ===== */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "flex-end",
        }}
      >
        <IconButton size="small" onClick={() => onEdit(user)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(user)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onRoles(user)}>
          <PeopleIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};
