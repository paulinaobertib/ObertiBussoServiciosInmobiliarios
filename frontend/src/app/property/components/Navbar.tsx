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
import { usePropertyCrud } from '../context/PropertiesContext';
import { useAuthContext } from '../../user/context/AuthContext';

export const NAVBAR_HEIGHT = 56;
export const NAVBAR_HEIGHT_XS = 48;

export default function NavBar() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { clearComparison } = usePropertyCrud();
  const { login, logout, isLogged, isAdmin } = useAuthContext();

  // Navegar a admin o perfil
  const goToProfile = () => {
    navigate(isAdmin ? ROUTES.ADMIN_PANEL : ROUTES.USER_PROFILE);
  };

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const handleOpenNavMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorElNav(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

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
              navigate(ROUTES.HOME_APP);
            }}
          />

          {/* Móvil: menú + logo centrado */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              alignItems: 'center',
              position: 'relative',
              width: '100%',
            }}
          >
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              color="inherit"
              aria-label="open menu"
              sx={{ position: 'absolute', left: 0 }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                height: 40,
                objectFit: 'contain',
                cursor: 'pointer',
                margin: '0 auto',
              }}
              onClick={() => {
                clearComparison();
                navigate(ROUTES.HOME_APP);
              }}
            />

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

              <MenuItem
                onClick={() => {
                  handleCloseNavMenu();
                  isLogged ? logout() : login();
                }}
              >
                {isLogged ? 'SALIR' : 'INICIAR SESIÓN'}
              </MenuItem>
              {!isLogged && (
                <MenuItem
                  onClick={() => {
                    handleCloseNavMenu();
                  }}
                >
                  REGISTRO
                </MenuItem>
              )}
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
                <Button color="inherit" sx={{ textTransform: 'none' }}>
                  REGISTRO
                </Button>
              </>
            )}
            {isLogged && (
              <>
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
