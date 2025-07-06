import { Box, Container, Toolbar } from '@mui/material';
import { PropsWithChildren } from 'react';
import { NavBar } from '../app/shared/components/Navbar';

interface BasePageProps {
  maxWidth?: boolean;
}

export const BasePage = ({
  children,
  maxWidth = true,
}: PropsWithChildren<BasePageProps>) => {
  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Fondo fijo con blur */}
      {/* <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          // backgroundImage: `url('../../public/fondo1.jpg')`,
          background: `
            linear-gradient(
              rgba(255, 214, 168, 0.274),
              rgba(255, 198, 133, 0.274)
            ),
            url('../../public/fondo1.jpg') center/cover no-repeat
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1,               // detrás de todo
          filter: 'blur(7px)',      // aquí el efecto borroso
        }}
      /> */}

      {/* Tu contenido va aquí */}
      <NavBar />
      <Container
        maxWidth={maxWidth ? 'lg' : false}
        sx={{
          // Asegura que el contenido esté por encima de la imagen
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Container>
    </Box>
  );
};
