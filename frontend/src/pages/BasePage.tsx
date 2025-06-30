import { Container, Toolbar } from '@mui/material';
import { PropsWithChildren } from 'react';
import { NavBar } from '../app/shared/components/Navbar';

interface BasePageProps {
  maxWidth?: boolean; // Prop opcional para definir si debe estirarse el contenedor
}

export const BasePage = ({ children, maxWidth = true }: PropsWithChildren<BasePageProps>) => (
  <>
    <NavBar />
    <Container maxWidth={maxWidth ? "lg" : false} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      {children}
    </Container>
  </>
);