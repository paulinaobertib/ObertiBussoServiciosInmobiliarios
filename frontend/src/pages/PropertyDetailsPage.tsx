import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { BasePage } from './BasePage';
import PropertyDetails from '../app/property/components/propertyDetails/propertyDetails';
import { getPropertyById } from '../app/property/services/property.service';
import { Property } from '../app/property/types/property';

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      </BasePage >
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
      <PropertyDetails property={property} />
    </BasePage>
  );
};

export default PropertyDetailsPage;