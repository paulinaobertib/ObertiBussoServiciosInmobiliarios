import React, { useMemo } from 'react';
import { Card, Box, Chip, Typography, useTheme, Checkbox } from '@mui/material';
import { FavoriteButton } from '../../../user/components/favorites/FavoriteButtom';
import { Property } from '../../types/property';
import { useAuthContext } from '../../../user/context/AuthContext';
//import { Star } from 'lucide-react';

export interface Props {
  property: Property;
  selectionMode?: boolean;
  isSelected?: (id: number) => boolean;
  toggleSelection?: (id: number) => void;
  onClick?: () => void;
}

const getExtendingBadgeConfig = () => {
  return {
    position: { top: '96%', right: -0.95, transform: 'translateY(-40%)', },
    gradient: 'linear-gradient(135deg, #FAB360 0%, #EB7333 60%, #EE671E 100%)',
    glowColor: 'rgba(255, 111, 0, 0.4)',
    shadowColor: 'rgba(255, 111, 0, 0.15)',
    //borderRadius: '20px',
    borderRadius: '25px 0px 0px 25px',
  };
};

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


  const badgeConfig = getExtendingBadgeConfig(); 

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

        {/* Badge DESTACADA Extendido */}
        {property.outstanding && (
          <Box
            sx={{
              position: 'absolute',
              ...badgeConfig.position,
              background: badgeConfig.gradient,
              color: "rgba(26, 26, 26, 0.7)",
              px: { xs: 0.5, xl: 1 },
              py: { xs: 0.5, xl: 1 },
              fontSize: { xs: "0.50rem", xl: "0.70rem" },
              fontWeight: { xs: 600, xl: 700 },
              fontFamily: 'Helvetica',
              letterSpacing: { xs: 0.5, md: 1 },
              borderRadius: badgeConfig.borderRadius,
              boxShadow: `0 6px 20px ${badgeConfig.glowColor}, 0 3px 6px rgba(0, 0, 0, 0.3)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 0.4, sm: 0.6, xl: 0.8 },
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(6px)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              zIndex: 2,
              minWidth: { xs: '80px', sm: '100px', xl: '120px' },
              backgroundSize: '200% 200%',
              overflow: 'hidden',       // importantísimo para que no se salga el brillo
            }}
          >
            {/* Brillo interno limitado al chip */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: '-60%',      // comienza fuera a la izquierda
                width: '70%',      // ancho controlado para que no se extienda más
                height: '100%',
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                borderRadius: 'inherit',
                animation: 'shineSlide 3s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Texto encima del brillo */}
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              DESTACADA
            </Box>

            {/* Animación CSS */}
            <style>
              {`
                @keyframes shineSlide {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(200%);
                  }
                }
              `}
            </style>
          </Box>
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
