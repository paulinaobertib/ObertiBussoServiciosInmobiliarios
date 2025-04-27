import { Box, Grid } from '@mui/material';
import ButtonGrid from '../components/ButtonCRUD';
import ListGetCRUD from '../components/ListGetCRUD';
import { useCRUD } from '../context/CRUDContext';

const CreateProperty = () => {
  const { selectedCategory } = useCRUD();

  return (
    <Box sx={{ display: 'flex', height: { xs: 'auto', md: '90vh' }, flexDirection: { xs: 'column', md: 'row' } }}>

      {/* Panel izquierdo */}
      <Box sx={{ width: { xs: '100%', md: '40%' }, borderRight: '2px solid #ddd', display: 'flex', flexDirection: 'column' }}>

        {/* Botones de categorías */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%', border: '1px solid black', p: 2 }}>
          <Grid container spacing={2} columns={2} justifyContent="center">
            <ButtonGrid label="Cargar Barrio" category="neighborhood" />
            <ButtonGrid label="Cargar propietario" category="owner" />
            <ButtonGrid label="Cargar Servicios" category="amenity" />
            <ButtonGrid label="Cargar Tipo de Propiedad" category="type" />
            {/* <ButtonGrid label="Cargar Imagen" category="image" /> */}
          </Grid>
        </Box>

        {/* Lista de datos */}
        <Box sx={{ height: '50%', border: '1px solid black', p: 2, maxHeight: '50%', overflowY: 'auto' }}>
          {selectedCategory && <ListGetCRUD />}
        </Box>
      </Box>

      {/* Panel derecho */}
      <Box sx={{ width: { md: '65%' }, p: 2, border: '1px solid black' }}>
        {/* ACÁ después pongo el formulario de la propiedad */}
      </Box>

    </Box >
  );
};

export default CreateProperty;
