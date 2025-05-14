import logo from '../../../assets/logoJPG.png';

const pages = ['Catálogo', 'Contacto', 'Blog'];
export const NAVBAR_HEIGHT = 56; // desktop
export const NAVBAR_HEIGHT_XS = 48; // mobile

import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { LinkProps, useNavigate } from 'react-router-dom';
import { Logout, Menu } from '@mui/icons-material';

export const NavBarLink = ({ to, children }: LinkProps) => {
  const { palette } = useTheme();
  const { primary, background, common } = palette;
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => {
        navigate(to);
      }}
      size="small"
      variant='contained'
      disableElevation
      sx={{
        '&:hover': {
          backgroundColor: background.default,
          color: primary.main,
        },
        backgroundColor: false ? primary.contrastText : primary.main,
        color: false ? primary.main : common.white,
        my: 2,
        display: 'block',
      }}
    >
      <Typography sx={{ textTransform: 'none' }}>{children}</Typography>
    </Button>
  );
};

export const MobileNavBarLink = ({
  name,
  to,
}: LinkProps & { name: string }) => {
  const navigate = useNavigate();
  return (
    <ListItem
      disablePadding
      onClick={() => navigate(to)}
    >
      <ListItemButton sx={{ textAlign: 'center' }}>
        <ListItemText primary={name} />
      </ListItemButton>
    </ListItem>
  );
};

export default function NavBar() {
  const { palette, breakpoints } = useTheme();
  const isMobileScreen = useMediaQuery(breakpoints.only('xs'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar component="nav">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobileScreen && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <Menu />
              </IconButton>
            )}
            {!isMobileScreen && (
              <>
                <Box sx={{ display: 'flex', marginRight: 2 }}>
                  <img src={logo} alt="logo" width={90} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, marginRight: 1 }}>
                  {pages.map((page) => (
                    <NavBarLink key={page} to={page}>
                      {page}
                    </NavBarLink>
                  ))}
                </Box>
              </>
            )}
          </Box>
          <Button
            variant="text"
            sx={{ color: palette.common.white }}
            startIcon={<Logout />}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      {isMobileScreen && (
        <Drawer
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 180 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              paddingY: 1,
            }}
          >
            <img src={logo} alt="logo" width={140} />
          </Box>
          <Divider />
          <List>
            {pages.map((page) => (
              <MobileNavBarLink key={page} to={page} name={page} />
            ))}
          </List>
        </Drawer>
      )}
    </>
  );
};

