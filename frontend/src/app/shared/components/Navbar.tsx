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

          {/* Mobile: Menu + Logo + Settings */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              alignItems: 'center',
              position: 'relative',
              width: '100%',
              justifyContent: 'center',
            }}
          >

            <Box
              sx={{
                position: 'absolute',
                left: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <IconButton
                size="small"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => navigate(ROUTES.CONTRACT)}
                color="inherit"
              >
                <RealEstateAgentIcon />
              </IconButton>

            </Box>

            <Box
              component="img"
              src={logo}
              alt="Logo"
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

            <Box
              sx={{
                position: 'absolute',
                right: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <SettingsDrawer />
              {isLogged && (
                <Tooltip title="Notificaciones">
                  <IconButton
                    color="inherit"
                    aria-label="logout"
                    onClick={logout}
                    sx={{ p: 0.5 }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate(ROUTES.CONTACT); }}>
                CONTACTO
              </MenuItem>
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate(ROUTES.NEWS); }}>
                NOTICIAS
              </MenuItem>

              {isLogged && (
                <MenuItem onClick={() => { handleCloseNavMenu(); goToProfile(); }}>
                  {isAdmin ? 'PANEL' : 'PERFIL'}
                </MenuItem>
              )}

              {isLogged && !isAdmin && (
                <MenuItem onClick={() => { handleCloseNavMenu(); navigate(ROUTES.FAVORITES); }}>
                  MIS FAVORITOS
                </MenuItem>
              )}

              {!isLogged && !isAdmin && (
                <MenuItem onClick={() => { handleCloseNavMenu(); login(); }}>
                  INICIAR SESIÓN
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Desktop Links */}
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
            {isTenant && (
              <Button
                onClick={() => navigate(ROUTES.CONTRACT)}
                sx={{
                  color: palette.common.white,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                SOY INQUILINO
              </Button>
            )}
          </Box>

          {/* Desktop Actions */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, ml: 'auto' }}>
            {!isLogged && (
              <Button color="inherit" onClick={login} sx={{ textTransform: 'none' }}>
                INICIAR SESIÓN
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
      </Box >
    </AppBar >
  );
};
