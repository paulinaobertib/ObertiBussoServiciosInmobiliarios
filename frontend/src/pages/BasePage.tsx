import { Container, Toolbar } from '@mui/material';
import { PropsWithChildren } from 'react';
import Navbar from '../app/property/components/Navbar';

export const BasePage = ({ children }: PropsWithChildren) => (
    <>
        <Navbar />
        <Container maxWidth={false} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar />
            {children}
        </Container>
    </>
);