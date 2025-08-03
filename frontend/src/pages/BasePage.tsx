import { Box, Container, Toolbar } from '@mui/material';
import { PropsWithChildren } from 'react';
import { NavBar } from '../app/shared/components/Navbar';
import Footer from '../app/shared/components/Footer';

interface BasePageProps {
  maxWidth?: boolean;
  /** Controla si se muestra el Footer */
  showFooter?: boolean;
}

export const BasePage = ({ children, maxWidth = true, showFooter = true }: PropsWithChildren<BasePageProps>) => {
  return (
    <Box
      component="div"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Navbar fijo arriba */}
      <NavBar />

      {/* Contenedor principal */}
      <Container
        maxWidth={false}
        sx={{
          flexGrow: 1,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 2,
          mx: 'auto',
          ...(maxWidth && {
            width: {
              xs: '100%',
              sm: '95%',
              md: '90%',
              lg: '80%',
            },
            maxWidth: '1600px',
          }),
        }}
      >
        <Toolbar />
        {children}
      </Container>

      {/* Footer condicional */}
      {showFooter && <Footer />}
    </Box>
  );
};

export default BasePage;
