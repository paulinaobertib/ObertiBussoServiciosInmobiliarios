import { Box, Fab, Tooltip, SpeedDial, SpeedDialAction, useTheme, Portal } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import selectIcon from "../../../../assets/ic_select.png";
import cancelIcon from "../../../../assets/ic_cancel.svg";
import compareIcon from "../../../../assets/ic_comparer.png";
import { useAuthContext } from "../../../user/context/AuthContext";
import { usePropertiesContext } from "../../context/PropertiesContext";
import { useState } from "react";
import { fabSlot } from "../../../shared/utils/fabSlot";

interface Props {
  onAction: (action: "create" | "edit" | "delete") => void;
  selectionMode: boolean;
  toggleSelectionMode: () => void;
  onCompare?: () => void;
}

const adminActions = [
  { icon: <AddCircleOutlineIcon data-testid="admin-action-create" />, name: "Agregar", action: "create" as const },
  { icon: <EditIcon data-testid="admin-action-edit" />, name: "Editar", action: "edit" as const },
  { icon: <DeleteIcon data-testid="admin-action-delete" />, name: "Eliminar", action: "delete" as const },
];

export const FloatingButtons = ({ onAction, selectionMode, toggleSelectionMode, onCompare }: Props) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const { isAdmin } = useAuthContext();
  const { disabledCompare } = usePropertiesContext();
  const size = "3.5rem";

  const userContent = !isAdmin ? (
    <Box
      sx={{
        ...fabSlot(1, size),
        display: "flex",
        alignItems: "center",
        gap: { xs: "8px", sm: "12px", md: "16px" },
      }}
    >
      <Tooltip title={disabledCompare || !onCompare ? "Selecciona 2 o 3 propiedades" : "Comparar propiedades"} arrow>
        <span>
          <Fab
            data-testid="user-action-compare"
            disabled={disabledCompare || !onCompare}
            onClick={() => {
              if (!disabledCompare && onCompare) {
                onCompare();
              }
            }}
            sx={{
              width: size,
              height: size,
              bgcolor: theme.palette.primary.main,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              color: "#fff",
            }}
          >
            <img src={compareIcon} alt="Comparer" style={{ width: "2.2rem", height: "2.2rem" }} />
          </Fab>
        </span>
      </Tooltip>

      <Tooltip title={selectionMode ? "Cancelar selección" : "Seleccionar"} arrow>
        <Fab
          data-testid="user-action-toggle-selection"
          onClick={toggleSelectionMode}
          sx={{
            width: size,
            height: size,
            bgcolor: theme.palette.primary.main,
            "&:hover": { bgcolor: theme.palette.primary.dark },
            color: "#fff",
          }}
        >
          <img
            src={selectionMode ? cancelIcon : selectIcon}
            alt={selectionMode ? "Cancelar selección" : "Seleccionar"}
            style={{ width: "2.2rem", height: "2.2rem" }}
          />
        </Fab>
      </Tooltip>
    </Box>
  ) : null;

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

  const content = (
    <>
      {userContent}
      {adminContent}
    </>
  );

  const portalContainer = typeof window !== "undefined" ? document.body : null;

  if (!portalContainer) {
    return content;
  }

  return <Portal container={portalContainer}>{content}</Portal>;
};
