import { Container, Toolbar, Box } from '@mui/material';
import { PropsWithChildren } from 'react';
import { NavBar } from '../app/shared/components/Navbar';
import { Chat } from '../app/chat/components/Chat';

interface BasePageProps {
  maxWidth?: boolean; // Prop opcional para definir si debe estirarse el contenedor
}

export const BasePage = ({ children, maxWidth = true }: PropsWithChildren<BasePageProps>) => (
  <>
    <NavBar />
    <Container maxWidth={maxWidth ? "lg" : false} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      {children}
      <Box
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1300,
          }}
        >
          <Chat propertyId={propertyId} sessionId={sessionId} />
        </Box>
    </Container>
  </>
);