import { useEffect, useState } from 'react';
import { useParams} from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Navbar from '../../app/property/components/navbar';
import PropertyDetails from '../../app/property/components/propertyDetails';
import { getPropertyById } from '../../app/property/services/propertyService';
import { Property } from '../../app/property/types/property';

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
      <>
        <Navbar />
        <Box sx={{ p: 4 }}>
          <Typography variant="h5">Cargando...</Typography>
        </Box>
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" color="error">
            {error || 'Propiedad no encontrada'}
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PropertyDetails property={property} />
    </>
  );
};

export default PropertyDetailsPage;