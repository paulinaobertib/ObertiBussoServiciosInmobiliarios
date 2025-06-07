import { useEffect } from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { BasePage } from './BasePage';
import CategoryButton from '../app/property/components/CategoryButton';
import CategoryItems from '../app/property/components/CategoryItems';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';

export default function AdminPanel() {
    const { resetSelected, pickItem } = usePropertyCrud();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/'); // o navigate(-1) si quieres volver a la página anterior
    };

    useEffect(() => {
        pickItem('category', null);
        resetSelected();
    }, []);

    return (
        <BasePage maxWidth={false}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: -2 }}>
                <Button variant="contained" color="primary" onClick={handleBack}>
                    VOLVER
                </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Panel de Administración
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <CategoryButton category="owner" />
                    <CategoryButton category="property" />
                </Stack>

                <Box sx={{ flexGrow: 1, minHeight: 0, boxShadow: 2, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
                    <CategoryItems />
                </Box>
            </Box>
        </BasePage>
    );
}
