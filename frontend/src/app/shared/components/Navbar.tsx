import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Toolbar, IconButton, Button, useTheme, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LogoutIcon from "@mui/icons-material/Logout";
import RealEstateAgentIcon from "@mui/icons-material/RealEstateAgent";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import LoginIcon from "@mui/icons-material/Login";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ContactMailIcon from "../../../assets/ic_consulta.svg";
import NewspaperIcon from "../../../assets/ic_news.svg";
import { ROUTES } from "../../../lib";
import logo from "../../../assets/logoJPG.png";

import { usePropertiesContext } from "../../property/context/PropertiesContext";
import { useAuthContext } from "../../user/context/AuthContext";
import SettingsDrawer from "../../user/components/Settings";
import MobileActionsDrawer, { MobileActionItem } from "./MobileActionsDrawer";

export const NAVBAR_HEIGHT = 56;
export const NAVBAR_HEIGHT_XS = 48;

export const NavBar = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { clearComparison, resetSelected, pickItem } = usePropertiesContext();
  const { login, logout, isLogged, isAdmin, isTenant, info } = useAuthContext();

  const [mobileActionsOpen, setMobileActionsOpen] = React.useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = React.useState(false);

  const openMobileActions = React.useCallback(() => setMobileActionsOpen(true), []);
  const closeMobileActions = React.useCallback(() => setMobileActionsOpen(false), []);

  const handleOpenNotifications = React.useCallback(() => {
    setNotificationDrawerOpen(true);
  }, []);

  const profileName = React.useMemo(() => {
    if (!info) return undefined;
    const parts = [info.firstName, info.lastName].filter(Boolean).join(" ").trim();
    if (parts) return parts;
    return info.userName || info.email;
  }, [info]);

  const profileEmail = info?.email;

  const goHome = () => {
    clearComparison();
    resetSelected();
    pickItem("category", null);
    navigate(ROUTES.HOME_APP);
  };

  const goToProfile = React.useCallback(() => {
    navigate(isAdmin ? ROUTES.ADMIN_PAGE : ROUTES.USER_PROFILE);
  }, [isAdmin, navigate]);

  const mobileActionItems = React.useMemo<MobileActionItem[]>(() => {
    const withClose =
      (cb: () => void): (() => void) =>
      () => {
        closeMobileActions();
        cb();
      };

    const contactIcon = <Box component="img" src={ContactMailIcon} alt="Contacto" sx={{ width: 24, height: 24 }} />;
    const newsIcon = <Box component="img" src={NewspaperIcon} alt="Noticias" sx={{ width: 24, height: 24 }} />;

    if (!isLogged) {
      return [
        { label: "Contacto / Turnero de Citas", icon: contactIcon, onClick: withClose(() => navigate(ROUTES.CONTACT)) },
        { label: "Noticias", icon: newsIcon, onClick: withClose(() => navigate(ROUTES.NEWS)) },
      ];
    }

    if (isAdmin) {
      return [
        { label: "Mi Perfil", icon: <AccountCircleIcon />, onClick: withClose(goToProfile) },
        { label: "Turnero de Citas", icon: <MenuIcon />, onClick: withClose(() => navigate(ROUTES.APPOINTMENTS)) },
        {
          label: "Contratos de Alquiler",
          icon: <RealEstateAgentIcon />,
          onClick: withClose(() => navigate(ROUTES.CONTRACT)),
        },
        { label: "Noticias", icon: newsIcon, onClick: withClose(() => navigate(ROUTES.NEWS)) },
        { label: "Mis Notificaciones", icon: <NotificationsIcon />, onClick: withClose(handleOpenNotifications) },
        { label: "Ver Estadísticas", icon: <QueryStatsIcon />, onClick: withClose(() => navigate(ROUTES.CONTRACT)) },
      ];
    }

    const items: MobileActionItem[] = [
      { label: "Mi Perfil", icon: <AccountCircleIcon />, onClick: withClose(goToProfile) },
      { label: "Mis Favoritos", icon: <FavoriteIcon />, onClick: withClose(() => navigate(ROUTES.FAVORITES)) },
      { label: "Contacto / Turnero de Citas", icon: contactIcon, onClick: withClose(() => navigate(ROUTES.CONTACT)) },
      { label: "Noticias", icon: newsIcon, onClick: withClose(() => navigate(ROUTES.NEWS)) },
      { label: "Mis Notificaciones", icon: <NotificationsIcon />, onClick: withClose(handleOpenNotifications) },
    ];

    if (isTenant) {
      items.splice(1, 0, {
        label: "Mis Contratos de Alquiler",
        icon: <RealEstateAgentIcon />,
        onClick: withClose(() => navigate(ROUTES.CONTRACT)),
      });
    }

    return items;
  }, [closeMobileActions, goToProfile, handleOpenNotifications, isAdmin, isLogged, isTenant, navigate]);

  return (
    <AppBar component="nav" sx={{ height: { xs: NAVBAR_HEIGHT_XS, sm: NAVBAR_HEIGHT }, zIndex: 2000 }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Toolbar
          disableGutters
          sx={{
            width: "90%",
            justifyContent: { xs: "center", sm: "space-between" },
            height: { xs: NAVBAR_HEIGHT_XS, sm: NAVBAR_HEIGHT },
            minHeight: { xs: NAVBAR_HEIGHT_XS, sm: NAVBAR_HEIGHT },
          }}
        >
          {/* Logo Desktop */}
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              display: { xs: "none", sm: "flex" },
              height: 50,
              objectFit: "contain",
              cursor: "pointer",
            }}
            onClick={goHome}
          />

          {/* Mobile (xs): layout por estado */}
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              alignItems: "center",
              position: "relative",
              width: "100%",
              justifyContent: "center",
            }}
          >
            {/* IZQUIERDA (xs) */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {!mobileActionsOpen && (
                <Tooltip title="Abrir menú">
                  <IconButton size="small" onClick={openMobileActions} color="inherit" aria-label="menu">
                    <MenuIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Logo centrado (xs) */}
            <Box
              component="img"
              src={logo}
              alt="Logo"
              data-testid="logo-mobile"
              sx={{
                height: 40,
                objectFit: "contain",
                cursor: "pointer",
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
              onClick={goHome}
            />

            {/* DERECHA (xs) */}
            <Box
              sx={{
                position: "absolute",
                right: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* NO LOGUEADO: Iniciar sesión */}
              {!isLogged && (
                <Tooltip title="Iniciar sesión">
                  <IconButton
                    color="inherit"
                    aria-label="login"
                    onClick={login}
                    sx={{ p: 0.5, transform: "rotateY(180deg)" }}
                  >
                    <LoginIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* LOGUEADO USUARIO: Salir */}
              {isLogged && !isAdmin && (
                <Tooltip title="Salir">
                  <IconButton color="inherit" aria-label="logout" onClick={logout}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* ADMIN: Salir */}
              {isAdmin && (
                <Tooltip title="Salir">
                  <IconButton color="inherit" aria-label="logout" onClick={logout}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Desktop Links (sm+) — sin cambios */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2, ml: 4 }}>
            <Button
              onClick={() => navigate(isAdmin ? ROUTES.APPOINTMENTS : ROUTES.CONTACT)}
              sx={{
                color: palette.common.white,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              {isAdmin ? "Turnero" : "Contacto"}
            </Button>

            <Button
              data-testid="navbar-news"
              onClick={() => navigate(ROUTES.NEWS)}
              sx={{
                color: palette.common.white,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              Noticias
            </Button>

            {isTenant && (
              <Button
                onClick={() => navigate(ROUTES.CONTRACT)}
                data-testid="tenant-contracts-button-desktop"
                sx={{
                  color: palette.common.white,
                  textTransform: "none",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                Soy Inquilino
              </Button>
            )}

            {isAdmin && (
              <Button
                onClick={() => navigate(ROUTES.CONTRACT)}
                sx={{
                  color: palette.common.white,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                Contratos
              </Button>
            )}
          </Box>

          {/* Desktop Actions (sm+) — sin cambios */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1, ml: "auto" }}>
            {!isLogged && (
              <Button color="inherit" onClick={login}>
                Iniciar Sesión
              </Button>
            )}
            {isLogged && (
              <>
                <Tooltip title="Notificaciones">
                  <IconButton
                    color="inherit"
                    aria-label="notifications"
                    onClick={() => setNotificationDrawerOpen(true)}
                  >
                    <NotificationsIcon />
                  </IconButton>
                </Tooltip>

                {!isAdmin && (
                  <Tooltip title="Mis Favoritos">
                    <IconButton color="inherit" aria-label="favorites" onClick={() => navigate(ROUTES.FAVORITES)}>
                      <FavoriteIcon />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title={isAdmin ? "Panel de Administrador" : "Perfil"}>
                  <IconButton
                    color="inherit"
                    aria-label="profile"
                    data-testid={isAdmin ? "navbar-admin-panel" : "navbar-user-profile"}
                    onClick={goToProfile}
                  >
                    <AccountCircleIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Salir">
                  <IconButton color="inherit" aria-label="logout" onClick={logout}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Toolbar>
      </Box>

      {/* Settings Drawer - renderizado fuera del AppBar */}
      <SettingsDrawer
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        topOffsetMobile={NAVBAR_HEIGHT_XS}
        topOffsetDesktop={NAVBAR_HEIGHT}
      />
      <MobileActionsDrawer
        open={mobileActionsOpen}
        onClose={closeMobileActions}
        items={mobileActionItems}
        topOffsetMobile={NAVBAR_HEIGHT_XS}
        topOffsetDesktop={NAVBAR_HEIGHT}
        profileName={profileName}
        profileEmail={profileEmail}
        isLoggedIn={isLogged}
        onLogin={!isLogged ? login : undefined}
        onLogout={isLogged ? logout : undefined}
      />
    </AppBar>
  );
};
