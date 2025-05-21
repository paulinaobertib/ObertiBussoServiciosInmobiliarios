// src/pages/PropertyDetailsPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { BasePage } from './BasePage';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';
import PropertyDetails from '../app/property/components/propertyDetails/PropertyDetails';

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Contexto
  const { currentProperty, loadProperty } = usePropertyCrud();

  // Locales para loading y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetch = async () => {
      if (!id) {
        setError('ID de propiedad no proporcionado');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await loadProperty(Number(id));
      } catch {
        setError('Error al cargar la propiedad');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, loadProperty]);

  return (
    <BasePage maxWidth={false}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: -4 }}>
        <Button variant="contained" color="primary" onClick={handleBack}>
          VOLVER
        </Button>
      </Box>

      {loading && (
        <Box sx={{ p: 4 }}>
          <Typography variant="h5">Cargando...</Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {!loading && !error && currentProperty && (
        <PropertyDetails property={currentProperty} />
      )}
    </BasePage>
  );
};

export default PropertyDetailsPage;
