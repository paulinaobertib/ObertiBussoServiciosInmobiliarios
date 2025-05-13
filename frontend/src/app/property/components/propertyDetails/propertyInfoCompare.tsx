import { Box, Typography, Chip, useMediaQuery, useTheme } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import ImageCarousel from './carousel';
import { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatPrice';
import { useComparison } from '../../context/comparisonContext';
import * as React from 'react';

interface PropertyInfoProps {
  property: Property;
}

// Función para mostrar singular/plural o "-"
const formatFeatureLabel = (
  value: number | null | undefined,
  singular: string,
  plural: string
) => {
  if (!value || value <= 0) return `-`;
  return `${value} ${value === 1 ? singular : plural}`;
};

const PropertyInfo = ({ property }: PropertyInfoProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { comparisonItems } = useComparison();

  // Definir las claves numéricas para las características
  type NumericFeatureKey = 'bedrooms' | 'bathrooms' | 'rooms' | 'area';

  // Determinar qué características mostrar
  const getCommonFeatures = () => {
    const features: { key: NumericFeatureKey; label: string; icon: React.ReactNode }[] = [
      {
        key: 'bedrooms',
        label: formatFeatureLabel(property.bedrooms, 'dormitorio', 'dormitorios'),
        icon: <HotelIcon color="primary" />,
      },
      {
        key: 'bathrooms',
        label: formatFeatureLabel(property.bathrooms, 'baño', 'baños'),
        icon: <BathtubIcon color="primary" />,
      },
      {
        key: 'rooms',
        label: formatFeatureLabel(property.rooms, 'ambiente', 'ambientes'),
        icon: <DoorFrontIcon color="primary" />,
      },
      {
        key: 'area',
        label: property.area && property.area > 0 ? `${property.area} m²` : '-',
        icon: <SquareFootIcon color="primary" />,
      },
    ];

    // Si no hay comparación, mostrar todas las características
    if (comparisonItems.length <= 1) {
      return features;
    }

    // Obtener la otra propiedad en comparación
    const otherProperty = comparisonItems.find((item) => item.id !== property.id);

    // Si no hay otra propiedad, mostrar todas las características
    if (!otherProperty) {
      return features;
    }

    // Filtrar características comunes
    return features.filter((feature) => {
      const propValue = property[feature.key] as number | null;
      const otherPropValue = otherProperty[feature.key] as number | null;

      // Mostrar la característica si al menos una propiedad tiene un valor válido
      return (
        (propValue && propValue > 0) ||
        (otherPropValue && otherPropValue > 0)
      );
    });
  };

  const features = getCommonFeatures();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        maxWidth: { xs: '100%', md: '90vw', lg: '80vw' },
        mx: 'auto',
        width: '100%',
        p: isMobile ? theme.spacing(1) : theme.spacing(2),
      }}
    >
      {/* Título */}
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        component="h1"
        fontWeight="bold"
        sx={{ textAlign: 'center' }}
      >
        {property.title}
      </Typography>

      {/* Imágenes */}
      <Box sx={{ width: '100%', minHeight: '30vh' }}>
        <ImageCarousel
          images={property.images}
          mainImage={property.mainImage}
          title={property.title}
        />
      </Box>

      {/* Barrio */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(0.5) }}>
        <LocationOnIcon color="action" fontSize={isMobile ? 'small' : 'medium'} />
        <Typography variant={isMobile ? 'body2' : 'body1'} color="text.secondary">
          {property.neighborhood
            ? `${property.neighborhood.name}, ${property.neighborhood.city}`
            : 'Barrio desconocido'}
        </Typography>
      </Box>

      {/* Precio */}
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        color="primary"
        fontWeight="bold"
      >
        {formatPrice(property.price, property.currency)}
      </Typography>

      {/* Operación y Estado */}
      <Box sx={{ display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }}>
        <Chip
          label={property.operation}
          size={isMobile ? 'small' : 'medium'}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={property.status}
          size={isMobile ? 'small' : 'medium'}
          color="default"
        />
      </Box>

      {/* Características */}
      {features.map((feature, index) => (
        <Box
          key={index}
          sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(2) }}
        >
          <Box
            sx={{
              bgcolor: 'primary.50',
              borderRadius: '50%',
              width: isMobile ? theme.spacing(4) : theme.spacing(5),
              height: isMobile ? theme.spacing(4) : theme.spacing(5),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {feature.icon}
          </Box>
          <Typography variant={isMobile ? 'body2' : 'body1'}>
            {feature.label}
          </Typography>
        </Box>
      ))}

      {/* Descripción */}
      {property.description && (
        <Box>
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            fontWeight="bold"
            sx={{ mb: theme.spacing(1) }}
          >
            Descripción
          </Typography>
          <Typography
            variant={isMobile ? 'body2' : 'subtitle1'}
            color="text.secondary"
          >
            {property.description}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PropertyInfo;