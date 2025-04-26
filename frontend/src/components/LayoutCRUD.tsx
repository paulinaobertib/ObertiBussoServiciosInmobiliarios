import { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ButtonGrid from './ButtonCRUD';

const LayoutCRUD = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const handleCategoryClick = (category: string) => setSelectedCategory(category);

    return (
        <Box sx={{ display: 'flex', height: { xs: 'auto', md: '95vh' }, flexDirection: { xs: 'column', md: 'row' } }}>

            {/* Lado Izquierdo */}
            <Box sx={{ width: { xs: '100%', md: '35%' }, borderRight: '2px solid #ddd', display: 'flex', flexDirection: 'column' }} >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%', border: '1px solid black', p: 2 }}>
                    <Grid container spacing={2} columns={2} justifyContent="center">
                        <ButtonGrid label="Agregar Barrio" category="barrio" onClick={handleCategoryClick} />
                        <ButtonGrid label="Agregar Dueno" category="dueno" onClick={handleCategoryClick} />
                        <ButtonGrid label="Agregar Servicios" category="servicio" onClick={handleCategoryClick} />
                        <ButtonGrid label="Agregar Tipo de Propiedad" category="tipo de propiedad" onClick={handleCategoryClick} />
                        <ButtonGrid label="Agregar Imagen" category="imagen" onClick={handleCategoryClick} />
                    </Grid>
                </Box>

                <Box sx={{ height: '50%', border: '1px solid black', p: 2 }}>
                    {selectedCategory && (
                        <Typography variant="h6" sx={{ mb: 2 }}>Datos de {selectedCategory}:</Typography>
                    )}
                </Box>
            </Box >

            {/* Lado Derecho */}
            < Box sx={{ width: { md: '65%' }, p: 2, border: '1px solid black' }} >

            </Box >

        </Box >
    );
};

export default LayoutCRUD;
