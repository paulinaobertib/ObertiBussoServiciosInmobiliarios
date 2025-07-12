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

import LogoutIcon from '@mui/icons-material/Logout';
import { ROUTES } from '../../../lib';
import logo from '../../../assets/logoJPG.png';
import { usePropertiesContext } from '../../property/context/PropertiesContext';
import { useAuthContext } from '../../user/context/AuthContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsDrawer from '../../user/components/Settings';

export const NAVBAR_HEIGHT = 56;
export const NAVBAR_HEIGHT_XS = 48;

export const NavBar = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { clearComparison, resetSelected, pickItem } = usePropertiesContext();
  const { login, logout, isLogged, isAdmin } = useAuthContext();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const handleOpenNavMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorElNav(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  // Navegar a admin o perfil
  const goToProfile = () => {
    navigate(isAdmin ? ROUTES.ADMIN_PANEL : ROUTES.USER_PROFILE);
  };

  const goHome = () => {
    clearComparison();                  // limpia comparación
    resetSelected();                    // limpia owner/type/neighborhood/amenities
    pickItem('category', null);         // limpia filtro de categoría
    navigate(ROUTES.HOME_APP);          // finalmente navega
  };


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
          {/* Logo desktop */}
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
            onClick={() => {
              clearComparison();
              goHome();
            }}
          />

          {/* Móvil: menú + logo centrado */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              alignItems: 'center',
              position: 'relative',
              width: '100%',
              justifyContent: 'center', // Center content horizontally
            }}
          >
            {/* Menu Icon */}
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              color="inherit"
              aria-label="open menu"
              sx={{ position: 'absolute', left: 0 }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                height: 40,
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute', // Use absolute positioning
                left: '50%', // Center horizontally
                transform: 'translateX(-50%)', // Offset by half its width
              }}
              onClick={() => {
                clearComparison();
                navigate(ROUTES.HOME_APP);
              }}
            />

            {/* Settings Drawer */}
            <Box sx={{ position: 'absolute', right: 0 }}>
              <SettingsDrawer />
            </Box>

            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              <MenuItem
                onClick={() => {
                  handleCloseNavMenu();
                  navigate(ROUTES.CONTACT);
                }}
              >
                CONTACTO
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseNavMenu();
                  navigate(ROUTES.NEWS);
                }}
              >
                NOTICIAS
              </MenuItem>

              {isLogged && (
                <MenuItem
                  onClick={() => {
                    handleCloseNavMenu();
                    goToProfile();
                  }}
                >
                  {isAdmin ? 'PANEL' : 'PERFIL'}
                </MenuItem>
              )}

              {isLogged && (
                <MenuItem
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate(ROUTES.FAVORITES);
                  }}
                >
                  MIS FAVORITOS
                </MenuItem>
              )}
              {isLogged && (
                <MenuItem
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate(ROUTES.FAVORITES);
                  }}
                >
                  MIS FAVORITOS
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  handleCloseNavMenu();
                  isLogged ? logout() : login();
                }}
              >
                {isLogged ? 'SALIR' : 'INICIAR SESIÓN'}
              </MenuItem>
            </Menu>
          </Box>

          {/* Desktop links */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, ml: 4 }}>
            <Button
              onClick={() => navigate(ROUTES.CONTACT)}
              sx={{
                color: palette.common.white,
                textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              CONTACTO
            </Button>
            <Button
              onClick={() => navigate(ROUTES.NEWS)}
              sx={{
                color: palette.common.white,
                textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              NOTICIAS
            </Button>
          </Box>

          {/* Desktop acciones con Tooltip */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, ml: 'auto' }}>
            {!isLogged && (
              <>
                <Button color="inherit" onClick={login} sx={{ textTransform: 'none' }}>
                  INICIAR SESIÓN
                </Button>
              </>
            )}
            {isLogged && (
              <>
                <Tooltip title="Notificaciones">
                  <SettingsDrawer />
                </Tooltip>
                <Tooltip title="Mis Favoritos">
                  <IconButton color="inherit" aria-label="favorites" onClick={() => navigate(ROUTES.FAVORITES)} >
                    <FavoriteIcon />
                  </IconButton>
                </Tooltip>
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
}
