import { Box, Typography, Chip, Button, Stack } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatPrice';
import { usePropertyCrud } from '../../context/PropertiesContext';

interface PropertyInfoProps {
  property: Property;
}

const formatFeatureLabel = (
  value: number | null | undefined,
  singular: string,
  plural: string
) => {
  if (!value || value <= 0) return '-';
  return `${value} ${value === 1 ? singular : plural}`;
};

const PropertyInfo = ({ property }: PropertyInfoProps) => {
  const { neighborhoodsList } = usePropertyCrud();

  const neighborhood =
    neighborhoodsList.find(n => n.id === property.neighborhoodId) || null;


  const features = [
    {
      label: formatFeatureLabel(property.bedrooms, 'dormitorio', 'dormitorios'),
      icon: <HotelIcon color="primary" />,
    },
    {
      label: formatFeatureLabel(property.bathrooms, 'baño', 'baños'),
      icon: <BathtubIcon color="primary" />,
    },
    {
      label: formatFeatureLabel(property.rooms, 'ambiente', 'ambientes'),
      icon: <DoorFrontIcon color="primary" />,
    },
    {
      label: property.area && property.area > 0 ? `${property.area} m²` : '-',
      icon: <SquareFootIcon color="primary" />,
    },
  ].filter((feature) => feature.label !== '-');


  return (
    <Stack spacing={3}>
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            {property.title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOnIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body1" color="text.secondary">
            {neighborhood ? `${neighborhood.name}, ${neighborhood.city}` : 'Barrio desconocido'}
          </Typography>
        </Box>
        <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
          {formatPrice(property.price, property.currency)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={property.operation}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip label={property.status} size="small" color="default" />
        </Box>

        {features.map((feature, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                bgcolor: 'primary.50',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {feature.icon}
            </Box>
            <Typography variant="body1">{feature.label}</Typography>
          </Box>
        ))}

        {property.description && (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Descripción
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {property.description}
            </Typography>
          </Box>
        )}
      </Box>
      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{
          py: 1.5,
          borderRadius: 2,
          backgroundColor: '#e65100',
          '&:hover': {
            backgroundColor: '#d84315',
          },
        }}
      >
        Contactar al vendedor
      </Button>
    </Stack>
  );
};

export default PropertyInfo;