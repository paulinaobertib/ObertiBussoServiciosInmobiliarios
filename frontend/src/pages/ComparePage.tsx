import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BasePage } from './BasePage';
import PropertyDetails from '../app/property/components/propertyDetails/propertyDetails';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';
// import { useEffect } from 'react';

export default function ComparePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { comparisonItems, selectedPropertyIds } = usePropertyCrud();
  console.log('ComparePage → comparisonItems:', comparisonItems);
  console.log('ComparePage → selectedPropertyIds:', selectedPropertyIds);

  // Si no hay dos propiedades, mostramos mensaje
  if (comparisonItems.length < 2) {
    return (
      <BasePage maxWidth={false}>
        <Container sx={{ py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Selecciona dos propiedades para comparar.
          </Typography>
        </Container>
      </BasePage>
    );
  }

  // Cuando salgamos de esta página, limpiamos la comparación
  // (opcional, así la próxima vez parte limpia)
  // useEffect(() => {
  //   return () => {
  //     clearComparison();
  //   };
  // }, [clearComparison]);

  return (
    <BasePage maxWidth={false}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 4,
          py: 4,
        }}
      >
        {comparisonItems.map((prop) => (
          <Box key={prop.id} sx={{ flex: 1, borderRadius: 2, overflow: 'hidden' }}>
            {/* Reutilizamos TODO: carrusel, info y mapa */}
            <PropertyDetails property={prop} />
          </Box>
        ))}
      </Box>
    </BasePage>
  );
}