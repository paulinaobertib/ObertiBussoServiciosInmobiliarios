import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { BasePage } from './BasePage';
import PropertyDetails from '../app/property/components/propertyDetails/propertyDetails';
import { getPropertyById } from '../app/property/services/property.service';
import { Property } from '../app/property/types/property';

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('ID de propiedad no proporcionado');
        setLoading(false);
        return;
      }

      try {
        const data = await getPropertyById(Number(id));
        setProperty(data);
      } catch (err) {
        setError('Error al cargar la propiedad');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <BasePage maxWidth={false}>
        <Box sx={{ p: 4 }}>
          <Typography variant="h5">Cargando...</Typography>
        </Box>
      </BasePage>
    );
  }

  if (error || !property) {
    return (
      <BasePage maxWidth={false}>
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" color="error">
            {error || 'Propiedad no encontrada'}
          </Typography>
        </Box>
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

      <PropertyDetails property={property} />
    </BasePage>
  );
};

export default PropertyDetailsPage;
