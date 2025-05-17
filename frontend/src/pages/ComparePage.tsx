import { Box, Button, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BasePage } from './BasePage';
import PropertyDetailsCompare from '../app/property/components/propertyDetails/propertyDetailsCompare';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';
import { useNavigate } from 'react-router-dom';

const Compare = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { comparisonItems } = usePropertyCrud();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  if (comparisonItems.length === 0) {
    return (
      <BasePage maxWidth={false}>
        <Container sx={{ py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            No hay propiedades para comparar.
          </Typography>
        </Container>
      </BasePage>
    );
  }

  if (comparisonItems.length !== 2) {
    return (
      <BasePage maxWidth={false}>
        <Container sx={{ py: 8 }}>
          <Typography variant="h5" color="error">
            Por favor selecciona exactamente 2 propiedades para comparar.
          </Typography>
        </Container>
      </BasePage>
    );
  }

  return (
    <BasePage maxWidth={false}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: -4 }}>
          <Button variant="contained" color="primary" onClick={handleBack}>
            VOLVER
          </Button>
        </Box>

      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 4,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <PropertyDetailsCompare comparisonItems={comparisonItems} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="primary" size="large" sx={{ minWidth: theme.spacing(25) }}>
            Mandar consulta
          </Button>
        </Box>
      </Container>
    </BasePage>
  );
};

export default Compare;
