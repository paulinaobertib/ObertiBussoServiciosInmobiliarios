import React, { useMemo } from 'react';
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

  const src = useMemo(() => {
    if (typeof property.mainImage === 'string') return property.mainImage;
    return URL.createObjectURL(property.mainImage);
  }, [property.mainImage]);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleSelection(property.id);
  };

  const isNew = Date.now() - new Date(property.date).getTime() < 3 * 24 * 60 * 60 * 1000; // ultimos 3 dias

  const chipLabel =
    property.status === 'DISPONIBLE'
      ? `${property.status} - ${property.operation}`
      : property.status || 'Sin Estado';

  return (
    <Card elevation={2}
      onClick={() => {
        if (!selectionMode) onClick();
      }}
      sx={{
        display: 'flex',
        position: "relative",
        overflow: "visible",
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        cursor: selectionMode ? 'default' : 'pointer',
        transition: 'transform 0.1s',
        '&:hover': { transform: 'scale(1.01)' },
        backgroundColor: theme.palette.quaternary.main,
      }}
    >

      {property.outstanding && (
        <Box
          sx={{
            position: "absolute",
            top: -15,
            left: 0,
            width: 180,
            height: 26,
            bgcolor: theme.palette.quaternary.main,
            borderRadius: "4px 4px 0 0",  // sólo esquinas de arriba
            display: "flex",
            // alignItems: "center",
            justifyContent: "center",
            zIndex: -1,
          }}
        >
          <Typography
            // variant="caption"
            sx={{
              color: 'black',
              fontWeight: 600,
              textTransform: "uppercase",
              fontSize: '0.7rem'
            }}
          >
            Propiedad destacada
          </Typography>
        </Box>
      )}

      {/* Imagen / Vídeo y controles */}
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={src}
          alt={property.title}
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            objectFit: 'cover',
            backgroundColor: '#000',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />


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
          textAlign: 'center',
          borderBottomLeftRadius: 8,    // redondea sólo arriba
          borderBottomRightRadius: 8,
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
              overflow: 'hidden',
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
                gap: 0.5,
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
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{ whiteSpace: 'nowrap' }}
                >
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
                <Typography
                  variant="subtitle2"
                  noWrap sx={{ whiteSpace: 'nowrap' }}
                >
                  {property?.expenses ?? 0 > 0
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
                Precio - Expensas
              </Typography>
              <Typography variant="subtitle2">
                Consultar
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
};
