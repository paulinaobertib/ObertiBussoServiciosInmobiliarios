import * as React from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Menu,
  MenuItem, Button, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../../../assets/logoJPG.png';

const pages = ['Catálogo', 'Contacto', 'Blog'];
export const NAVBAR_HEIGHT     = 56; // desktop
export const NAVBAR_HEIGHT_XS  = 48; // mobile

export default function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  return (
    <AppBar position="fixed" elevation={2}>
      <Toolbar
        variant="dense"                                   /* 1️⃣  más bajo de fábrica */
        sx={{
          minHeight: { xs: 48, md: 56 },                  /* 2️⃣  máximo permitido   */
          px: { xs: 1, sm: 2 },
        }}
      >
        {/* LOGO — se adapta sin desbordar */}
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            height: 36,
            mr: 2,
            display: { xs: 'none', md: 'block' },
            objectFit: 'contain',
          }}
        />

        {/* MENÚ HAMBURGUESA */}
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
          <IconButton color="inherit" onClick={handleOpenNavMenu}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorElNav}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            {pages.map(page => (
              <MenuItem key={page} onClick={handleCloseNavMenu}>
                {page}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* LOGO mobile */}
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            height: 32,
            mr: 2,
            display: { xs: 'block', md: 'none' },
            objectFit: 'contain',
          }}
        />

        {/* LINKS desktop */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          {pages.map(page => (
            <Button
              key={page}
              color="inherit"
              onClick={handleCloseNavMenu}
              sx={{ my: 0.5 }}
            >
              {page}
            </Button>
          ))}
        </Box>

        {/* BOTONES DERECHA */}
        <Box sx={{ flexGrow: 0 }}>
          <Button color="inherit" sx={{ fontSize: '0.75rem' }}>
            Mi Perfil
          </Button>
          <Button color="inherit" sx={{ fontSize: '0.75rem' }}>
            Cerrar sesión
          </Button>
        </Box>
      </Toolbar>

      {/* espaciador automático para el resto de la página */}
      <Box sx={{ ...theme.mixins.toolbar, display: 'none' }} />
    </AppBar>
  );
}
