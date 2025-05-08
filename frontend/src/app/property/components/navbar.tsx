import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import logo from '../../../assets/logoJPG.png';
import { Link } from 'react-router-dom';

const pages = ['Contacto', 'Noticias'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static">
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Toolbar
          disableGutters
          sx={{
            width: '90%',
            justifyContent: { xs: 'flex-start', md: 'space-between' },
            paddingLeft: { xs: 0, md: 'auto' },
          }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                display: { xs: 'none', md: 'flex' },
                height: 50,
                objectFit: 'contain',
                mr: 2,
              }}
            />
          </Link>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              color="inherit"
              aria-label="abrir menú"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Link to="/">
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
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu} component={Link} to={`/${page.toLowerCase()}`}>
                  {page}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {pages.map((page) => (
              <Button
                key={page}
                component={Link}
                to={`/${page.toLowerCase()}`}
                onClick={handleCloseNavMenu}
                sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <IconButton color="inherit" aria-label="perfil">
              <AccountCircleIcon sx={{ fontSize: 28 }} />
            </IconButton>
            <IconButton color="inherit" aria-label="cerrar sesión">
              <LogoutIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
}

export default ResponsiveAppBar;

