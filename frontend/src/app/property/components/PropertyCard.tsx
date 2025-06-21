import { MouseEvent } from 'react';
import { Card, Box, Chip, CardContent, Typography, useTheme } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import FavoriteButton from '../../user/components/FavoriteButtom';
import { Property } from '../types/property';

export type CatalogMode = 'normal' | 'edit' | 'delete';

export interface PropertyCardProps {
  property: Property;
  mode?: CatalogMode;
  selectionMode?: boolean;
  isSelected?: (id: number) => boolean;
  toggleSelection?: (id: number) => void;
  onClick?: () => void;
}

export default function PropertyCard({
  property,
  mode = 'normal',
  selectionMode = false,
  isSelected = () => false,
  toggleSelection = () => { },
  onClick = () => { },
}: PropertyCardProps) {
  const theme = useTheme();
  const src =
    typeof property.mainImage === 'string'
      ? property.mainImage
      : URL.createObjectURL(property.mainImage);

  const handleSelect = (e: MouseEvent) => {
    e.stopPropagation();
    toggleSelection(property.id);
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 2,
        '&:hover': {
          transform: mode !== 'normal' ? 'scale(1.01)' : undefined,
          backgroundColor:
            mode !== 'normal' ? theme.palette.action.hover : undefined,
        },
        transition: 'transform 0.2s, background-color 0.2s',
      }}
    >
      {/* botón favorito */}
      <FavoriteButton propertyId={property.id} />

      {/* imagen */}
      <Box
        component="div"
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      />

      {/* etiqueta de estado */}
      <Chip
        label={property.status || 'Sin Estado'}
        size="small"
        sx={{
          position: 'absolute',
          top: { xs: 6, sm: 8 },
          left: { xs: 6, sm: 10 },
          zIndex: 5,
          fontWeight: 600,
          fontSize: { xs: '0.6rem', sm: '0.75rem' },
          px: { xs: 0.5, sm: 1 },
          py: { xs: 0, sm: 0.5 },
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: '#e0e0e0',
          pointerEvents: 'none',
        }}
      />

      {/* contenido */}
      <CardContent sx={{ textAlign: 'center', backgroundColor: '#fed7aa', p: 2 }}>
        <Typography variant="h6" noWrap sx={{ fontSize: 'clamp(0.875rem,2vw,1.25rem)' }}>
          {property.title}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 'clamp(0.75rem,1.5vw,1rem)' }}>
          {property.showPrice
            ? `$${property.price.toLocaleString('es-AR')} ${property.currency}`
            : 'Consultar precio'}
        </Typography>
      </CardContent>

      {/* selección */}
      {selectionMode && (
        <Box
          onClick={handleSelect}
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            width: 28,
            height: 28,
            borderRadius: 1,
            border: `2px solid ${theme.palette.primary.main}`,
            backgroundColor: isSelected(property.id)
              ? theme.palette.primary.main
              : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          {isSelected(property.id) && <CheckIcon sx={{ color: '#fff' }} />}
        </Box>
      )}
    </Card>
  );
}
