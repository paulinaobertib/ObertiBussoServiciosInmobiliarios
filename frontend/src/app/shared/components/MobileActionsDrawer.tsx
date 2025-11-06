import React from "react";
import {
  Drawer,
  Box,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Button,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

export interface MobileActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface MobileActionsDrawerProps {
  open: boolean;
  onClose: () => void;
  items: MobileActionItem[];
  topOffsetMobile?: number;
  topOffsetDesktop?: number;
  profileName?: string;
  profileEmail?: string;
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
}

const drawerWidth = 320;

const MobileActionsDrawer: React.FC<MobileActionsDrawerProps> = ({
  open,
  onClose,
  items,
  topOffsetMobile = 0,
  topOffsetDesktop,
  profileName,
  profileEmail,
  isLoggedIn = false,
  onLogin,
  onLogout,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const resolvedTopOffsetDesktop = topOffsetDesktop ?? topOffsetMobile;
  const appliedTopOffset = isMobile ? topOffsetMobile : resolvedTopOffsetDesktop;

  const handleAuthAction = () => {
    onClose();
    if (isLoggedIn) {
      onLogout?.();
    } else {
      onLogin?.();
    }
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? "90%" : drawerWidth,
          display: "flex",
          flexDirection: "column",
          top: appliedTopOffset,
          height: `calc(100% - ${appliedTopOffset}px)`,
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          pt: 1,
          pb: 3,
          textAlign: "center",
          // borderBottom: `2px solid ${alpha(theme.palette.primary.main, 1)}`,
          color: "black",
          bgcolor: alpha(theme.palette.primary.main, 0.3),
        }}
      >
        <Stack spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.6 }}>
            Bienvenido/a
          </Typography>

          {isLoggedIn ? (
            <>
              <Stack spacing={0.5} alignItems="center">
                <Typography variant="subtitle1" sx={{ fontSize: "1.6rem", fontWeight: 600, letterSpacing: 0.3 }}>
                  {profileName || "Usuario"}
                </Typography>
                {profileEmail && (
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {profileEmail}
                  </Typography>
                )}
              </Stack>
            </>
          ) : (
            <Typography variant="body2" sx={{ maxWidth: 240, opacity: 0.85 }}>
              Inicia sesión para gestionar tus consultas y favoritos.
            </Typography>
          )}

          {(onLogin || onLogout) && (
            <Button onClick={handleAuthAction} variant="contained">
              {isLoggedIn ? "Cerrar Sesión" : "Iniciar Sesión"}
            </Button>
          )}
        </Stack>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <Box sx={{ px: 3, pt: 1, pb: 1 }}>
          <Typography variant="overline" sx={{ letterSpacing: 2, color: "text.secondary" }}>
            Navegación
          </Typography>
        </Box>
        <Box
          sx={{
            px: 3,
            pb: 3,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {items.length > 0 ? (
            items.map(({ label, icon, onClick }) => (
              <ListItemButton
                key={label}
                onClick={onClick}
                sx={{
                  width: "100%",
                  maxHeight: 64,
                  px: 2,
                  columnGap: 1.5,
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  alignItems: "center",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.3),
                    "& svg": { fontSize: 24, color: "#000000ff" },
                    "& img": {
                      width: 24,
                      height: 24,
                      objectFit: "contain",
                      filter: "grayscale(1) brightness(0) contrast(1.1)", // más oscuro
                    },
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: "1rem", fontWeight: 600, color: "text.primary", noWrap: true }}
                />
              </ListItemButton>
            ))
          ) : (
            <Box sx={{ p: 2.5, textAlign: "center", bgcolor: "background.paper", borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Sin acciones disponibles.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default MobileActionsDrawer;
