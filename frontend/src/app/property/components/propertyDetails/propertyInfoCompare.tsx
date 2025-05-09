import { Box, Typography, Chip, Card, CardContent, Stack, useMediaQuery, useTheme } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatPrice';

interface PropertyInfoProps {
  property: Property;
}

const PropertyInfo = ({ property }: PropertyInfoProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      label: 'Dormitorios',
      value: property.bedrooms ?? 0,
      icon: <HotelIcon color="primary" />,
    },
    {
      label: 'Baños',
      value: property.bathrooms ?? 0,
      icon: <BathtubIcon color="primary" />,
    },
    {
      label: 'Ambientes',
      value: property.rooms ?? 0,
      icon: <DoorFrontIcon color="primary" />,
    },
    {
      label: 'm²',
      value: property.area ?? 0,
      icon: <SquareFootIcon color="primary" />,
    },
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
            minHeight: 90,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            {property.title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOnIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body1" color="text.secondary">
            {property.neighborhood
              ? `${property.neighborhood.name}, ${property.neighborhood.city}`
              : 'Barrio desconocido'}
          </Typography>
        </Box>
        <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
          {formatPrice(property.price, property.currency)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={property.operation}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip label={property.status} size="small" color="default" />
        </Box>
      </Box>

      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Características
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: 2,
              mt: 1,
            }}
          >
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: '100%',
                minHeight: 48,
              }}
            >
              {feature.value > 0 ? (
                <>
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
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>
                      {feature.value}
                    </Typography>
                    <Typography variant="body1">{feature.label}</Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ height: 40 }} /> // caja vacía para mantener el lugar
              )}
            </Box>
          ))}
          </Box>
        </CardContent>
      </Card>

      {property.description && (
        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Descripción
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {property.description}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

export default PropertyInfo;
