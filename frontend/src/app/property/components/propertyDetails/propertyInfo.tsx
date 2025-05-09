import { Box, Typography, Chip, Card, CardContent, Button, Stack, useMediaQuery, useTheme } from '@mui/material';
  import LocationOnIcon from '@mui/icons-material/LocationOn';
  import HotelIcon from '@mui/icons-material/Hotel';
  import BathtubIcon from '@mui/icons-material/Bathtub';
  import DoorFrontIcon from '@mui/icons-material/DoorFront';
  import SquareFootIcon from '@mui/icons-material/SquareFoot';
  import { Property } from '../../types/property';
  import { formatPrice } from '../../../utils/formatPrice';
  
  interface PropertyInfoProps {
    property: Property;
  }
  
  const PropertyInfo = ({ property }: PropertyInfoProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
              {/* Lógica para el nombre del barrio */}
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
              {property.bedrooms > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    <HotelIcon color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>
                      {property.bedrooms}
                    </Typography>
                    <Typography variant="body1">Dormitorios</Typography>
                  </Box>
                </Box>
              )}
              {property.bathrooms > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    <BathtubIcon color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>
                      {property.bathrooms}
                    </Typography>
                    <Typography variant="body1">Baños</Typography>
                  </Box>
                </Box>
              )}
              {property.rooms > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    <DoorFrontIcon color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>
                      {property.rooms}
                    </Typography>
                    <Typography variant="body1">Ambientes</Typography>
                  </Box>
                </Box>
              )}
              {property.area > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    <SquareFootIcon color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>
                      {property.area}
                    </Typography>
                    <Typography variant="body1">m²</Typography>
                  </Box>
                </Box>
              )}
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