import { Box, Grid, Typography } from '@mui/material';
import ButtonGrid from '../components/ButtonCRUD';
import ListGetCRUD from '../components/ListGetCRUD';
import { useCRUD } from '../context/CRUDContext';
import PropertyForm from '../components/PropertyForm';
// import UploadFiles from '../components/UploadFiles';

const CreateProperty = () => {
  const { selectedCategories } = useCRUD();

  return (
    <Box sx=
      {{
        display: 'flex',
        height: { xs: 'auto', md: '90vh' },
        flexDirection: { xs: 'column', md: 'row' },
        p: 2
      }}>

      {/* Panel izquierdo */}
      <Box sx=
        {{
          width: { xs: '100%', md: '40%' },
          display: 'flex',
          flexDirection: 'column',

        }}>

        {/* Botones de categorías */}
        <Box
          sx={{
            flexShrink: 0,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 4,
            boxShadow: 5,
            overflow: 'hidden',
            mb: 2,
            mr: { md: 2 },
            // position: 'sticky', // Esto asegura que se quede fijo en la parte superior
            top: 0
          }}
        >
          <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold', color: '#EF6C00' }}>
            Gestión de Categorías
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            <ButtonGrid label="Cargar Barrio" category="neighborhood" />
            <ButtonGrid label="Cargar propietario" category="owner" />
            <ButtonGrid label="Cargar Servicios" category="amenity" />
            <ButtonGrid label="Cargar Tipo de Propiedad" category="type" />
            {/* <ButtonGrid label="Cargar Imagen" category="image" /> */}
          </Grid>
        </Box>

        {/* Lista de datos */}
        <Box sx=
          {{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            p: 2,
            borderRadius: 4,
            boxShadow: 5,
            mb: { xs: 2, md: 0 },
            mr: { md: 2 },
          }}>

          {!selectedCategories && (
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold', color: '#EF6C00' }}>
              Listado
            </Typography>
          )}

          {selectedCategories ? <ListGetCRUD /> : <Typography>Selecciona una categoría</Typography>}

        </Box>
      </Box>

      {/* Panel derecho */}
      <Box
        sx={{
          width: { md: '60%' },
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          mb: { xs: 2, md: 0 },
        }}
      >

        {/* Contenedor principal (70% formulario y 30% carga de imágenes) */}
        <Box sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
        }}>

          {/* Formulario (70% de la altura) */}
          <Box sx={{
            display: 'flex',
            borderRadius: 4,
            boxShadow: 5,
            p: 3,
            flexDirection: 'column',
            justifyContent: 'center',
            mb: 2
          }}>
            <Typography variant="h4" sx={{ textAlign: 'center', color: '#EF6C00', fontWeight: 'bold' }}>
              Crear Nueva Propiedad
            </Typography>

            <Box>
              <PropertyForm />
            </Box>

          </Box>

          {/* Cargar Imagenes (30% de la altura) */}
          <Box sx={{
            flex: 3, display: 'flex',
            borderRadius: 4,
            boxShadow: 5,
            p: 2,
            flexDirection: 'column', justifyContent: 'center'
          }}>
            <Typography variant="h4" sx={{ textAlign: 'center', color: '#EF6C00', fontWeight: 'bold' }}>
              Cargar Imagenes a la Propiedad
            </Typography>


          </Box>
        </Box>
      </Box>

    </Box >
  );
};

export default CreateProperty;
