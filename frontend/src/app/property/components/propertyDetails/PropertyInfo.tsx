import { useState } from 'react';
import { Box, Typography, Chip, Stack, IconButton, Divider, useTheme } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import FoundationIcon from '@mui/icons-material/Foundation';

import { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatPrice';
import { useAuthContext } from '../../../user/context/AuthContext';
import { ModalItem, Info } from '../categories/CategoryModal';
import { StatusForm } from '../forms/StatusForm';

interface Props { property: Property }

type Amenity = string | { id?: string | number; name?: string; label?: string };


export const PropertyInfo = ({ property }: Props) => {
  const { isAdmin } = useAuthContext();
  const [statusModal, setStatusModal] = useState<Info | null>(null);
  const theme = useTheme();

  const labelOfAmenity = (a: Amenity) => (typeof a === 'string' ? a : a.name ?? a.label ?? '');
  const keyOfAmenity = (a: Amenity, i: number) => (typeof a === 'string' ? a : a.id ?? i);
  const featureLabel = (v?: number | null, s?: string, p?: string) => v && v > 0 ? `${v} ${v === 1 ? s : p}` : '-';
  // Numeric features
  const features = [
    { label: featureLabel(property.bedrooms, 'dormitorio', 'dormitorios'), icon: <HotelIcon sx={{ color: theme.palette.primary.main }} /> },
    { label: featureLabel(property.bathrooms, 'baño', 'baños'), icon: <BathtubIcon sx={{ color: theme.palette.primary.main }} /> },
    { label: featureLabel(property.rooms, 'ambiente', 'ambientes'), icon: <DoorFrontIcon sx={{ color: theme.palette.primary.main }} /> },
    { label: property.area ? `${property.area} m²` : '- m²', icon: <SquareFootIcon sx={{ color: theme.palette.primary.main }} /> },
    { label: property.coveredArea ? `${property.coveredArea} m² cubiertos` : '- m² cubiertos', icon: <FoundationIcon sx={{ color: theme.palette.primary.main }} /> },
  ].filter(f => !f.label.startsWith('-'));

  // Amenities
  const rawAmenities: Amenity[] = property.amenities ?? [];
  const amenities = rawAmenities.map(labelOfAmenity).filter(Boolean);

  // Address
  const address = property.neighborhood
    ? `${property.street}, ${property.neighborhood.name}, ${property.neighborhood.city}`
    : property.street ?? '';

  return (
    <Stack spacing={2}>
      {/* Title */}
      <Typography variant='h5' fontWeight={700} gutterBottom>
        {property.title}
      </Typography>

      {/* Location */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
        <LocationOnIcon fontSize='small' sx={{ opacity: 0.7, fontSize: 18 }} />
        <Typography variant='body2' color='text.secondary'>
          {address || 'Ubicación desconocida'}
        </Typography>
      </Box>

      {/* Price & Expenses */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
        <Typography variant='h5' color='primary' fontWeight={700}>
          {property.showPrice && property.price > 0
            ? formatPrice(property.price, property.currency)
            : 'Consultar precio'}
        </Typography>
        {property.showPrice && (
          <Typography variant='subtitle1' color='text.secondary' fontWeight={600}>
            {property.expenses && property.expenses > 0
              ? `Expensas ${formatPrice(property.expenses, 'ARS')}`
              : 'Sin expensas'}
          </Typography>
        )}
      </Box>

      {/* Operation/Status */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Chip
          label={property.operation.toUpperCase()}
          size='medium'
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: '#fff', fontWeight: 600, fontSize: '0.875rem', py: 0.5, px: 1.2
          }}
        />
        <Chip
          label={property.status}
          size='medium'
          sx={{ fontSize: '0.875rem' }}
        />

        {/* Admin edit */}
        {isAdmin && (
          <IconButton size='small' onClick={() => setStatusModal({
            title: 'Editar estado', Component: StatusForm,
            componentProps: { action: 'edit-status' as const, item: { id: property.id, status: property.status } }
          })} sx={{ mb: 1 }}>
            <EditIcon fontSize='small' />
          </IconButton>
        )}
        {statusModal && <ModalItem info={statusModal} close={() => setStatusModal(null)} />}
      </Box>

      {/* Two-column Features & Amenities */}
      {(features.length || amenities.length) && (
        <Box>
          <Divider />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
            {/* Features */}
            <Stack spacing={2}>
              <Typography variant='subtitle1' fontWeight={600}>Especificaciones</Typography>
              {features.map((f, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {f.icon}
                  <Typography variant='body2'>{f.label}</Typography>
                </Box>
              ))}
            </Stack>

            {/* Amenities */}
            <Stack spacing={1}>
              <Typography variant='subtitle1' fontWeight={600}>Características</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {rawAmenities.map((am, i) => (
                  <Chip
                    key={keyOfAmenity(am, i)}
                    label={labelOfAmenity(am)}
                    size='small'
                    variant='outlined'
                  />
                ))}
              </Box>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Description */}
      {property.description && (
        <Box>
          <Divider />
          <Typography variant='subtitle1' fontWeight={700} sx={{ mt: 2 }}>Descripción</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            {property.description}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};
