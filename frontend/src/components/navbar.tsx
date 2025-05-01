import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import logo from '../assets/logoJPG.png';

const pages = ['Catálogo', 'Contacto', 'Blog'];

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
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 }, overflowX: 'hidden' }}>
        <Toolbar disableGutters sx={{ width: '100%', overflowX: 'hidden' }}>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              display: { xs: 'none', md: 'flex' },
              height: 40,
              maxWidth: '100%',
              objectFit: 'contain',
              mr: 2,
            }}
          />

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menú de navegación"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={handleCloseNavMenu}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  {page}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              display: { xs: 'flex', md: 'none' },
              height: 40,
              maxWidth: '100%',
              objectFit: 'contain',
              mr: 2,
            }}
          />

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'block',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex'}}>
            <Button
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                },
                fontSize: { xs: '0.75rem', sm: '1rem' }, 
              }}
            >
              Mi Perfil
            </Button>
            <Button
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                },
                fontSize: { xs: '0.75rem', sm: '1rem' },
              }}
            >
              Cerrar sesión
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
