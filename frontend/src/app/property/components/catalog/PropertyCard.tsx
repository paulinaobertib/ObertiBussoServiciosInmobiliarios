import React from 'react';
import { Card, Box, Chip, Typography, useTheme, Checkbox } from '@mui/material';
import { FavoriteButton } from '../../../user/components/favorites/FavoriteButtom';
import { Property } from '../../types/property';
import { useAuthContext } from '../../../user/context/AuthContext';

export interface Props {
  property: Property;
  selectionMode?: boolean;
  isSelected?: (id: number) => boolean;
  toggleSelection?: (id: number) => void;
  onClick?: () => void;
}

export const PropertyCard = ({
  property,
  selectionMode = false,
  isSelected = () => false,
  toggleSelection = () => { },
  onClick = () => { },
}: Props) => {
  const theme = useTheme();
  const selected = selectionMode && isSelected(property.id);
  const { isAdmin } = useAuthContext();
  const src =
    typeof property.mainImage === 'string'
      ? property.mainImage
      : URL.createObjectURL(property.mainImage);

  const isVideo =
    (property.mainImage instanceof File && property.mainImage.type.startsWith('video/')) ||
    (typeof property.mainImage === 'string' &&
      /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(property.mainImage));


  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleSelection(property.id);
  };

  // Detectamos si es “nueva” 
  const isNew =
    Date.now() - new Date(property.date).getTime() <
    3 * 24 * 60 * 60 * 1000; // ultimos 3 dias

  const chipLabel =
    property.status === 'DISPONIBLE'
      ? `${property.status} - ${property.operation}`
      : property.status || 'Sin Estado';

  return (
    <Card
      onClick={() => {
        if (!selectionMode) onClick();
      }}
      variant="elevation"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 3,
        borderColor: selected
          ? theme.palette.primary.main
          : 'divider',
        borderWidth: selected ? 2 : 1,
        overflow: 'hidden',
        cursor: selectionMode ? 'default' : 'pointer',
        width: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          transform: 'scale(1.01)',
          boxShadow: 3,
          borderColor: selected
            ? theme.palette.primary.main
            : theme.palette.divider,
        },
      }}
    >

      {/* Imagen / Vídeo y controles */}
      <Box sx={{ position: 'relative' }}>
        {isVideo ? (
          <Box
            component="video"
            src={src}
            muted
            autoPlay
            loop
            playsInline
            onContextMenu={e => e.preventDefault()}
            sx={{
              width: '100%',
              aspectRatio: '16/9',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              aspectRatio: '16/9',
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}

        {/* Chips agrupados */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            gap: 1,
          }}
        >
          {isNew && (
            <Chip
              label="NUEVA"
              size="small"
              sx={{
                bgcolor: theme.palette.quaternary.main,
                color: theme.palette.quaternary.contrastText,
                fontSize: '0.65rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                pointerEvents: 'none',
              }}
            />
          )}
          <Chip
            label={chipLabel}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.8)',
              fontSize: '0.65rem',
              fontWeight: 500,
              textTransform: 'capitalize',
              pointerEvents: 'none',
            }}
          />
        </Box>

        {selectionMode && (
          <Checkbox
            checked={selected}
            onChange={handleSelect}
            size="medium"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              p: 0,
            }}
            inputProps={{ 'aria-label': 'Seleccionar propiedad' }}
          />
        )}

        {!isAdmin && (
          <Box sx={{ position: 'absolute', top: -5, right: -5 }}>
            <FavoriteButton propertyId={property.id} />
          </Box>
        )}
      </Box>

      {/* Contenido inferior */}
      <Box
        sx={{
          pb: 1,
          px: 2,
          backgroundColor: theme.palette.quaternary.main,
          textAlign: 'center',
        }}
      >
        {/* Título */}
        <Box
          sx={{
            minHeight: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              lineHeight: '1.3rem',
              whiteSpace: 'normal',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {property.title}
          </Typography>
        </Box>

        {/* Precio y expensas */}
        <Box sx={{ mb: '0.5rem' }}>
          {property.showPrice ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  p: 0.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Precio
                </Typography>
                <Typography variant="subtitle2">
                  {`${property.currency} $${property.price}`}
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: 0.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Expensas
                </Typography>
                <Typography variant="subtitle2">
                  {property.expenses > 0
                    ? `${property.currency} $${property.expenses}`
                    : 'No'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                p: 0.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 0.5,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Precio – Expensas
              </Typography>
              <Typography variant="subtitle2">
                Consultar
              </Typography>
            </Box>
          )}
        </Box>

        {/* Métricas */}
        {/* <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SquareFootIcon fontSize="small" />
            <Typography variant="caption">
              {`${property.area} m²`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ViewComfyIcon fontSize="small" />
            <Typography variant="caption">
              {property.rooms}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HotelIcon fontSize="small" />
            <Typography variant="caption">
              {property.bedrooms}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BathtubIcon fontSize="small" />
            <Typography variant="caption">
              {property.bathrooms}
            </Typography>
          </Box>
        </Box> */}
      </Box>
    </Card>
  );
};
