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
        maxWidth={false}        // quito el límite por defecto
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          px: 2,
          mx: 'auto',

          // cuando maxWidth=true, ajusto un ancho "responsivo" más generoso
          ...(maxWidth && {
            width: {
              xs: '100%',    // móvil ocupa 100%
              sm: '95%',     // tablet 95%
              md: '90%',     // escritorio mediano 90%
              lg: '80%',     // pantallas grandes 80%
            },
            maxWidth: '1600px', // nunca pase de 1600px
          }),
        }}
      >
        <Toolbar />
        {children}
      </Container>
    </Box>
  );
};
