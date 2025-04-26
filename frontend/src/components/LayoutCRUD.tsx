// AGREGAR ESTE COMO ESTÁ AL ORIGINAL

import { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ButtonGrid from './ButtonCRUD';
import { getAllAmenities } from '../services/amenitieService';
import { getAllOwners } from '../services/ownerService';
import { getAllPropertyTypes } from '../services/typeService';
import { getAllNeighborhood } from '../services/neighborhoodService';
import CategoryList from './ListGetCRUD';

const LayoutCRUD = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const handleCategoryClick = (category: string) => setSelectedCategory(category);
    const [data, setData] = useState<any>(null);

    const fetchData = async (category: string) => {
        try {
            switch (category) {
                case 'dueno':
                    return await getAllOwners();
                case 'barrio':
                    return await getAllNeighborhood();
                case 'servicio':
                    return await getAllAmenities();
                case 'tipo de propiedad':
                    return await getAllPropertyTypes();
                default:
                    return null;
            }
        } catch (error) {
            console.error(`Error cargando ${category}:`, error);
            return null;
        }
    };

    useEffect(() => {
        if (selectedCategory) {
            const loadData = async () => {
                const result = await fetchData(selectedCategory);
                setData(result);
            };
            loadData();
        } else {
            setData(null);
        }
    }, [selectedCategory]);

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
                    {data && selectedCategory === 'dueno' && <CategoryList category="dueno" data={data} />}
                    {data && selectedCategory === 'barrio' && <CategoryList category="barrio" data={data} />}
                    {data && selectedCategory === 'servicio' && <CategoryList category="servicio" data={data} />}
                    {data && selectedCategory === 'tipo de propiedad' && <CategoryList category="tipo de propiedad" data={data} />}
                </Box>
            </Box >

            {/* Lado Derecho */}
            < Box sx={{ width: { md: '65%' }, p: 2, border: '1px solid black' }} >
                {/* Mostrar los datos cargados */}

            </Box >

        </Box >
    );
};

export default LayoutCRUD;
