
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { ROUTES } from '../../../lib';
import logo from '../../../assets/logoJPG.png';
import { usePropertyCrud } from '../context/PropertiesContext';

const pages = [
  { label: 'CONTACTO', route: `/contact` },
  { label: 'NOTICIAS', route: `/news` },
];

const GW_URL = import.meta.env.VITE_GATEWAY_URL as string;
const loginUrl = `${GW_URL}/oauth2/authorization/keycloak-client?next=/`;

export const NAVBAR_HEIGHT = 56;
export const NAVBAR_HEIGHT_XS = 48;

export default function NavBar() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const { clearComparison } = usePropertyCrud();

  const handleOpenNavMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(e.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <AppBar component="nav" sx={{ height: { xs: NAVBAR_HEIGHT_XS, sm: NAVBAR_HEIGHT } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Toolbar
          disableGutters
          sx={{
            width: '90%',
            justifyContent: { xs: 'flex-start', sm: 'space-between' },
            paddingLeft: { xs: 0, sm: 'auto' },
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

          {/* Menu mobile y logo */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', }}>
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              color="inherit"
              aria-label="open menu"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ height: 40, objectFit: 'contain', cursor: 'pointer' }}
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
              sx={{ display: { xs: 'block', sm: 'none' } }}
            >
              {pages.map(({ label, route }) => (
                <MenuItem
                  key={label}
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate(route);
                  }}
                >
                  {label}
                </MenuItem>
              ))}

              <MenuItem
                onClick={() => {
                  handleCloseNavMenu();
                  window.location.href = loginUrl;
                }}
              >
                INICIAR SESIÓN
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseNavMenu();
                  // window.location.assign(registerUrl)
                }}
              >
                REGISTRO
              </MenuItem>
            </Menu>
          </Box>

          {/* Desktop links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' }, gap: 2, ml: 4 }}>
            {pages.map(({ label, route }) => (
              <Button
                key={label}
                onClick={() => {
                  handleCloseNavMenu();
                  navigate(route);
                }}
                sx={{
                  color: palette.common.white,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, ml: 'auto' }}>
            <Button
              color="inherit"
              onClick={() => window.location.href = loginUrl}
              sx={{ textTransform: 'none' }}
            >
              INICIAR SESIÓN
            </Button>
            <Button
              color="inherit"
              // onClick={() => window.location.href = registerUrl}
              sx={{ textTransform: 'none' }}
            >
              REGISTRO
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <IconButton
              color="inherit"
              aria-label="profile"
              onClick={() => navigate(ROUTES.ADMIN_PANEL)}
              sx={{ fontSize: { xs: 28, sm: 28 } }}
            >
              <AccountCircleIcon sx={{ fontSize: 28 }} />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="logout"
              onClick={handleLogout}
              sx={{ fontSize: { xs: 28, sm: 28 } }}
            >
              <LogoutIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
}
