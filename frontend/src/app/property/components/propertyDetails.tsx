import { Box, Button, Typography } from '@mui/material';
import { Property } from '../types/property';
import { useNavigate } from 'react-router-dom';

interface PropertyDetailsProps {
  property: Property;
}

const PropertyDetails = ({ property }: PropertyDetailsProps) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, maxWidth: '400px', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {property.title}
      </Typography>
      <img
        src={property.mainImage || '/default-image.jpg'}
        alt={property.title}
        style={{ width: '100%', height: 'auto', borderRadius: 8, marginBottom: 16 }}
      />
      <Typography variant="h6" gutterBottom>
        Precio: ${property.price.toLocaleString()} USD
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Estado: {property.status}
      </Typography>
      {property.description && (
        <Typography variant="body1" gutterBottom>
          Descripción: {property.description}
        </Typography>
      )}
      {property.address && (
        <Typography variant="body1" gutterBottom>
          Dirección: {property.address}
        </Typography>
      )}
      {property.bedrooms && (
        <Typography variant="body1" gutterBottom>
          Dormitorios: {property.bedrooms}
        </Typography>
      )}
      {property.bathrooms && (
        <Typography variant="body1" gutterBottom>
          Baños: {property.bathrooms}
        </Typography>
      )}
      {property.area && (
        <Typography variant="body1" gutterBottom>
          Área: {property.area} m²
        </Typography>
      )}
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{ mt: 2, backgroundColor: '#e65100', color: '#fff' }}
      >
        Volver al catálogo
      </Button>
    </Box>
  );
};

export default PropertyDetails;