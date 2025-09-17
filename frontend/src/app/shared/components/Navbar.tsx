import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  useTheme,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LogoutIcon from '@mui/icons-material/Logout';
import RealEstateAgentIcon from '@mui/icons-material/RealEstateAgent';
import LoginIcon from '@mui/icons-material/Login';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import NewspaperIcon from '@mui/icons-material/Newspaper';

import { ROUTES } from '../../../lib';
import logo from '../../../assets/logoJPG.png';

import { usePropertiesContext } from '../../property/context/PropertiesContext';
import { useAuthContext } from '../../user/context/AuthContext';
import SettingsDrawer from '../../user/components/Settings';

export const NAVBAR_HEIGHT = 56;
export const NAVBAR_HEIGHT_XS = 48;

export const NavBar = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { clearComparison, resetSelected, pickItem } = usePropertiesContext();
  const { login, logout, isLogged, isAdmin, isTenant } = useAuthContext();

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const handleOpenNavMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorElNav(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const goHome = () => {
    clearComparison();
    resetSelected();
    pickItem('category', null);
    navigate(ROUTES.HOME_APP);
  };

  const goToProfile = () => {
    navigate(isAdmin ? ROUTES.ADMIN_PAGE : ROUTES.USER_PROFILE);
  };

  const openMenu = Boolean(anchorElNav);

  return (
    <AppBar component="nav" sx={{ height: { xs: NAVBAR_HEIGHT_XS, sm: NAVBAR_HEIGHT } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Toolbar
          disableGutters
          sx={{
            width: '90%',
            justifyContent: { xs: 'center', sm: 'space-between' },
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
              display: { xs: 'none', sm: 'flex' },
              height: 50,
              objectFit: 'contain',
              cursor: 'pointer',
            }}
            onClick={goHome}
          />

          {/* Mobile (xs): layout por estado */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              alignItems: 'center',
              position: 'relative',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {/* IZQUIERDA (xs) */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {/* NO LOGUEADO: Contacto + Noticias */}
              {!isLogged && (
                <>
                  <Tooltip title="Contacto">
                    <IconButton size="small" color="inherit" onClick={() => navigate(ROUTES.CONTACT)}>
                      <ContactMailIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Noticias">
                    <IconButton size="small" color="inherit" onClick={() => navigate(ROUTES.NEWS)}>
                      <NewspaperIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              {/* LOGUEADO USUARIO: Perfil + Menú + (si inquilino) Soy inquilino */}
              {isLogged && !isAdmin && (
                <>
                  <IconButton
                    size="small"
                    onClick={handleOpenNavMenu}
                    color="inherit"
                    aria-label="menu"
                  >
                    <MenuIcon />
                  </IconButton>

                  {isTenant && (
                    <Tooltip title="Soy inquilino">
                      <IconButton
                        size="small"
                        onClick={() => navigate(ROUTES.CONTRACT)}
                        color="inherit"
                        aria-label="tenant"
                      >
                        <RealEstateAgentIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              )}

              {/* ADMIN: Menú + Contratos */}
              {isAdmin && (
                <>
                  <IconButton
                    size="small"
                    onClick={handleOpenNavMenu}
                    color="inherit"
                    aria-label="menu"
                  >
                    <MenuIcon />
                  </IconButton>

                  <Tooltip title="Contratos">
                    <IconButton
                      size="small"
                      onClick={() => navigate(ROUTES.CONTRACT)}
                      color="inherit"
                      aria-label="contracts"
                    >
                      <RealEstateAgentIcon />
                    </IconButton>
                  </Tooltip>
                </>
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
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
              onClick={goHome}
            />

            {/* DERECHA (xs) */}
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {/* NO LOGUEADO: Iniciar sesión */}
              {!isLogged && (
                <Tooltip title="Iniciar sesión">
                  <IconButton color="inherit" aria-label="login" onClick={login} sx={{ p: 0.5 }}>
                    <LoginIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* LOGUEADO USUARIO: Salir */}
              {isLogged && !isAdmin && (
                <>
                  <Tooltip title="Panel / Perfil">
                    <IconButton color="inherit" aria-label="profile" onClick={goToProfile}>
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

              {/* ADMIN: Perfil/Panel + Salir */}
              {isAdmin && (
                <>
                  <Tooltip title="Panel / Perfil">
                    <IconButton color="inherit" aria-label="profile" onClick={goToProfile}>
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

            {/* MENÚ (xs) — según estado */}
            <Menu
              anchorEl={anchorElNav}
              open={openMenu}
              onClose={handleCloseNavMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              {/* Logueado usuario: Contacto, Noticias, Mis favoritos, Notificaciones */}
              {isLogged && !isAdmin && ([
                <MenuItem key="contact" onClick={() => { handleCloseNavMenu(); navigate(ROUTES.CONTACT); }}>
                  CONTACTO
                </MenuItem>,
                <MenuItem key="news" onClick={() => { handleCloseNavMenu(); navigate(ROUTES.NEWS); }}>
                  NOTICIAS
                </MenuItem>,
                <MenuItem key="favorites" onClick={() => { handleCloseNavMenu(); navigate(ROUTES.FAVORITES); }}>
                  MIS FAVORITOS
                </MenuItem>,
                <MenuItem key="settings">
                  <SettingsDrawer />
                </MenuItem>
              ])}

              {/* Admin: Turnero + Noticias */}
              {isAdmin && ([
                <MenuItem key="appointments" onClick={() => { handleCloseNavMenu(); navigate(ROUTES.APPOINTMENTS); }}>
                  TURNERO
                </MenuItem>,
                <MenuItem key="news-admin" onClick={() => { handleCloseNavMenu(); navigate(ROUTES.NEWS); }}>
                  NOTICIAS
                </MenuItem>,
                <MenuItem key="settings-admin">
                  <SettingsDrawer />
                </MenuItem>
              ])}
              {/* No logueado: sin menú (no renderizamos items) */}
            </Menu>
          </Box>

          {/* Desktop Links (sm+) — sin cambios */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, ml: 4 }}>
            <Button
              onClick={() => navigate(isAdmin ? ROUTES.APPOINTMENTS : ROUTES.CONTACT)}
              sx={{
                color: palette.common.white,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              {isAdmin ? 'Turnero' : 'Contacto'}
            </Button>

            <Button
              onClick={() => navigate(ROUTES.NEWS)}
              sx={{
                color: palette.common.white,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Noticias
            </Button>

            {isTenant && (
              <Button
                onClick={() => navigate(ROUTES.CONTRACT)}
                sx={{
                  color: palette.common.white,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
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
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Contratos
              </Button>
            )}
          </Box>

          {/* Desktop Actions (sm+) — sin cambios */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, ml: 'auto' }}>
            {!isLogged && (
              <Button color="inherit" onClick={login}>
                Iniciar Sesión
              </Button>
            )}
            {isLogged && (
              <>
                <SettingsDrawer />

                {!isAdmin && (
                  <Tooltip title="Mis Favoritos">
                    <IconButton color="inherit" aria-label="favorites" onClick={() => navigate(ROUTES.FAVORITES)}>
                      <FavoriteIcon />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title={isAdmin ? 'Panel de Administrador' : 'Perfil'}>
                  <IconButton color="inherit" aria-label="profile" onClick={goToProfile}>
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
    </AppBar>
  );
};