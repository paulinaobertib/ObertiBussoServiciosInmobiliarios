import { Box, Typography, Chip, useMediaQuery, useTheme } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import ImageCarousel from './carousel';
import { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatPrice';

interface PropertyInfoProps {
  property: Property;
}

// Función para mostrar singular/plural o "-"
const formatFeatureLabel = (
  value: number | null | undefined,
  singular: string,
  plural: string
) => {
  if (!value || value <= 0) return '-';
  return `${value} ${value === 1 ? singular : plural}`;
};

const PropertyInfo = ({ property }: PropertyInfoProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: { xs: '100%', md: '600px' },
        mx: 'auto',
        width: '100%',
      }}
    >
      {/* Título */}
      <Typography
        variant="h4"
        component="h1"
        fontWeight="bold"
        sx={{ textAlign: 'center' }}
      >
        {property.title}
      </Typography>

      {/* Imágenes */}
      <Box sx={{ width: '100%', minHeight: 300 }}>
        <ImageCarousel
          images={property.images}
          mainImage={property.mainImage}
          title={property.title}
        />
      </Box>

      {/* Barrio */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <LocationOnIcon color="action" fontSize="small" />
        <Typography variant="body1" color="text.secondary">
          {property.neighborhood
            ? `${property.neighborhood.name}, ${property.neighborhood.city}`
            : 'Barrio desconocido'}
        </Typography>
      </Box>

      {/* Precio */}
      <Typography variant="h4" color="primary" fontWeight="bold">
        {formatPrice(property.price, property.currency)}
      </Typography>

      {/* Operación y Estado */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={property.operation}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Chip label={property.status} size="small" color="default" />
      </Box>

      {/* Características */}
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

      {/* Descripción */}
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
  );
};

export default PropertyInfo;