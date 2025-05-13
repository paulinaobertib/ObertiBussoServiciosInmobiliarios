import { Box, Typography, Button } from '@mui/material';
import Navbar from '../app/property/components/Navbar';
import PropertyDetails from '../app/property/components/propertyDetails/propertyDetailsCompare';
import { useComparison } from '../app/property/context/ComparisonContext';

const Compare = () => {
  const { comparisonItems } = useComparison();

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
        <Box sx={{ p: 4, overflowX: 'hidden' }}>
          <Typography variant="h5" color="error">
            Por favor selecciona exactamente 2 propiedades para comparar.
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            justifyContent: 'center',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {comparisonItems.map((property) => (
            <Box
              key={property.id}
              sx={{
                position: 'relative',
                flex: 1,
                width: '100%',
                maxWidth: '100%',
                overflowX: 'hidden',
              }}
            >
              <PropertyDetails property={property} />
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ minWidth: 200 }}
          >
            Contactar al vendedor
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Compare;
