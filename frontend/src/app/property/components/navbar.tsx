import * as React from 'react';
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
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../../../assets/logoJPG.png';
import { usePropertyCrud } from '../context/PropertiesContext'; 

const pages = ['CONTACTO', 'NOTICIAS'];
export const NAVBAR_HEIGHT = 56; // desktop
export const NAVBAR_HEIGHT_XS = 48; // mobile

export default function NavBar() {
  const { palette } = useTheme();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const { clearComparison } = usePropertyCrud(); 

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      component="nav"
      sx={{
        height: { xs: NAVBAR_HEIGHT_XS, sm: NAVBAR_HEIGHT },
      }}
    >
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
          <Link
            to="/"
            onClick={clearComparison}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                height: 50,
                objectFit: 'contain',
                mr: 2,
              }}
            />
          </Link>

          {/* Menu mobile y logo */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              color="inherit"
              aria-label="open menu"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            <Link to="/" onClick={clearComparison}>
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ height: 40, objectFit: 'contain' }}
              />
            </Link>

            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', sm: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={handleCloseNavMenu}
                  component={Link}
                  to={`/${page.toLowerCase()}`}
                >
                  {page}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Botones navegación desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
            {pages.map((page) => (
              <Button
                key={page}
                component={Link}
                to={`/${page.toLowerCase()}`}
                onClick={handleCloseNavMenu}
                sx={{
                  color: palette.common.white,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                  textTransform: 'none',
                }}
              >
                {page}
              </Button>
            ))}
          </Box>

          {/* Botones de usuario */}
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <IconButton color="inherit" aria-label="profile">
              <AccountCircleIcon sx={{ fontSize: 28 }} />
            </IconButton>
            <IconButton color="inherit" aria-label="logout">
              <LogoutIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
}
