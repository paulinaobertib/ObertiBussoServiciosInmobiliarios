import { Box, Typography, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import FoundationIcon from '@mui/icons-material/Foundation';
import { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatPrice';
import { usePropertyCrud } from '../../context/PropertiesContext';

interface Props {
  property: Property;
}

// Función para mostrar singular/plural o "- <plural>"
const formatFeatureLabel = (
  value: number | null | undefined,
  singular: string,
  plural: string
) => {
  if (!value || value <= 0) return `- `;
  return `${value} ${value === 1 ? singular : plural}`;
};

export const PropertyInfoCompare = ({ property }: Props) => {
  const { comparisonItems } = usePropertyCrud();

  // Definir las claves numéricas para las características
  type NumericFeatureKey = 'bedrooms' | 'bathrooms' | 'rooms' | 'area' | 'coveredArea';

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
        label: property.area && property.area > 0 ? `${property.area} m²` : '- m²',
        icon: <SquareFootIcon color="primary" />,
      },
      {
        key: 'coveredArea',
        label: property.coveredArea && property.coveredArea > 0 ? `${property.coveredArea} m² cubiertos` : '-',
        icon: <FoundationIcon color="primary" />,
      }
    ];

    // Si solo hay una propiedad, mostrarlas todas
    if (comparisonItems.length <= 1) return features;

    return features.filter((feature) => {
      const currentValue = property[feature.key] as number | null;

      // ¿Alguna otra propiedad tiene ese valor válido?
      const othersHaveValue = comparisonItems
        .filter((item) => item.id !== property.id)
        .some((item) => {
          const otherValue = item[feature.key] as number | null;
          return otherValue && otherValue > 0;
        });

      return (currentValue && currentValue > 0) || othersHaveValue;
    });
  };


  const features = getCommonFeatures();

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

      {/* Barrio */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <LocationOnIcon color="action" fontSize="small" />
        <Typography variant="body1" color="text.secondary">
          {property.street && property.neighborhood
            ? `${property.street}, ${property.neighborhood.name}, ${property.neighborhood.city}`
            : 'Ubicación desconocida'}
        </Typography>
      </Box>

      {/* Precio */}
      <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
        {property.showPrice && property.price > 0
          ? formatPrice(property.price, property.currency)
          : 'Consultar precio'}
      </Typography>

      {/* Operación y Estado */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={property.operation}
          size="medium"
          color="primary"
          variant="outlined"
        />
        <Chip label={property.status} size="medium" color="default" />
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

export default PropertyInfoCompare;