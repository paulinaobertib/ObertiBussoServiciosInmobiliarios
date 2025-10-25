import { Box, SpeedDial, SpeedDialAction, useTheme, Portal } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuthContext } from "../../../user/context/AuthContext";
import { useState } from "react";
import { fabSlot } from "../../../shared/utils/fabSlot";

interface Props {
  onAction: (action: "create" | "edit" | "delete") => void;
  selectionMode: boolean;
  toggleSelectionMode: () => void;
}

const adminActions = [
  { icon: <AddCircleOutlineIcon data-testid="admin-action-create" />, name: "Agregar", action: "create" as const },
  { icon: <EditIcon data-testid="admin-action-edit" />, name: "Editar", action: "edit" as const },
  { icon: <DeleteIcon data-testid="admin-action-delete" />, name: "Eliminar", action: "delete" as const },
];

export const FloatingButtons = ({ onAction, selectionMode, toggleSelectionMode }: Props) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const { isAdmin } = useAuthContext();
  const size = "3.5rem";

  const adminContent = isAdmin ? (
    <Box sx={fabSlot(0, size)}>
      <SpeedDial
        ariaLabel="Acciones de Propiedad"
        icon={<SettingsIcon />}
        direction="up"
        data-testid="admin-actions-speed-dial"
        onClick={() => setOpen((p) => !p)}
        open={open}
        sx={{
          position: "static", // el contenedor ya está fixed
          "& .MuiFab-primary": {
            width: size,
            height: size,
            bgcolor: theme.palette.primary.main,
            color: "#fff",
            "&:hover": { bgcolor: theme.palette.primary.dark },
          },
        }}
      >
        {adminActions.map(({ icon, name, action }) => (
          <SpeedDialAction
            key={name}
            icon={icon}
            tooltipTitle={name}
            onClick={() => {
              setOpen(false);
              if (selectionMode) {
                toggleSelectionMode();
              }
              onAction(action);
            }}
            FabProps={{
              sx: {
                width: size,
                height: size,
                bgcolor: theme.palette.primary.main,
                "&:hover": { bgcolor: theme.palette.primary.dark },
                color: "#fff",
              },
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  ) : null;

  const portalContainer = typeof window !== "undefined" ? document.body : null;

  if (!portalContainer) {
    return adminContent;
  }

  return <Portal container={portalContainer}>{adminContent}</Portal>;
};
