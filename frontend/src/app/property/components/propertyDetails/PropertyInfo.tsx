import { Box, Typography, Chip, Button, Stack, IconButton, useTheme } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import FoundationIcon from '@mui/icons-material/Foundation';
import EditIcon from '@mui/icons-material/Edit';
import { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatPrice';
import ModalItem from '../ModalItem';
import { useState } from 'react';
import { useAuthContext } from '../../../user/context/AuthContext';

interface PropertyInfoProps {
  property: Property;
}

export const formatFeatureLabel = (
  value: number | null | undefined,
  singular: string,
  plural: string
) => {
  if (!value || value <= 0) return '-';
  return `${value} ${value === 1 ? singular : plural}`;
};

const PropertyInfo = ({ property }: PropertyInfoProps) => {
  const [statusModal, setStatusModal] = useState<null | { action: 'edit-status'; item: { id: number; status: string } }>(null);
  const { isAdmin } = useAuthContext();
  const theme = useTheme()

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
    {
      label: property.coveredArea && property.coveredArea > 0 ? `${property.coveredArea} m² cubiertos` : '-',
      icon: <FoundationIcon color="primary" />,
    }
  ].filter((feature) => feature.label !== '-');

  return (
    <Stack spacing={3}>
      {/* Título y ubicación */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {property.title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOnIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body1" color="text.secondary">
            {property.street && property.neighborhood
              ? `${property.street}, ${property.neighborhood.name}, ${property.neighborhood.city}`
              : 'Ubicación desconocida'}
          </Typography>
        </Box>

        <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
          {property.showPrice && property.price > 0
            ? formatPrice(property.price, property.currency)
            : 'Consultar precio'}
        </Typography>

        {property.showPrice && (
          <Typography
            variant="h5"
            color="primary"
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            {property.expenses && property.expenses > 0
              ? formatPrice(property.expenses, 'ARS')
              : 'Sin expensas'}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={property.operation}
            size="medium"
            color="primary"
            variant="outlined"
            sx={{ height: 32, fontSize: '0.875rem' }}
          />
          <Chip
            label={property.status}
            size="medium"
            color="default"
            sx={{ height: 32, fontSize: '0.875rem' }}
          />
          {isAdmin && (
            <IconButton
              aria-label="editar estado"
              size="small"
              onClick={() =>
                setStatusModal({ action: 'edit-status', item: { id: property.id, status: property.status } })
              }
              sx={{ alignSelf: 'center' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {statusModal && (
          <ModalItem info={statusModal} close={() => setStatusModal(null)} />
        )}

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

      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{
          py: 1.5,
          borderRadius: 2,
          backgroundColor: theme.palette.secondary.main,
          '&:hover': { backgroundColor: theme.palette.secondary.dark },
        }}
      >
        Contactar al vendedor
      </Button>
    </Stack>
  );
};

export default PropertyInfo;
