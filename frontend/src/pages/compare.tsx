// src/pages/compare.tsx
import { Box, Typography, Button } from '@mui/material';
import Navbar from '../components/navbar';
import PropertyDetails from '../components/propertyDetails';
import { useComparison } from '../context/comparisonContext';

const Compare = () => {
  const { comparisonItems, clearComparison } = useComparison();

  console.log('Comparison Items in Compare:', comparisonItems); // Depuración

  if (comparisonItems.length === 0) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" color="text.secondary">
            No hay propiedades para comparar.
          </Typography>
        </Box>
      </>
    );
  }

  if (comparisonItems.length !== 2) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" color="error">
            Por favor selecciona exactamente 2 propiedades para comparar.
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Comparar propiedades
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={clearComparison}
            sx={{ backgroundColor: '#e65100', color: '#fff' }}
          >
            Limpiar comparación
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            justifyContent: 'center',
          }}
        >
          {comparisonItems.map((property) => (
            <Box key={property.id} sx={{ position: 'relative', flex: 1 }}>
              <PropertyDetails property={property} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  '& > button': { display: 'none' }, // Ocultamos el botón "Volver al catálogo"
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default Compare;