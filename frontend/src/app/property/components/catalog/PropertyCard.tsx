import { Card, Box, Chip, Typography, useTheme, Checkbox } from '@mui/material';
import { FavoriteButton } from '../../../user/components/FavoriteButtom';
import { Property } from '../../types/property';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';

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
  const src =
    typeof property.mainImage === 'string'
      ? property.mainImage
      : URL.createObjectURL(property.mainImage);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleSelection(property.id);
  };

  const chipLabel = property.status === 'DISPONIBLE'
    ? `${property.status} - ${property.operation}`
    : property.status || 'Sin Estado';

  return (
    <Card
      onClick={() => { if (!selectionMode) onClick(); }}
      variant="elevation"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 3,
        borderColor: selected ? theme.palette.primary.main : 'divider',
        borderWidth: selected ? 2 : 1,
        overflow: 'hidden',
        cursor: selectionMode ? 'default' : 'pointer',
        width: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          transform: 'scale(1.01)',
          boxShadow: 3,
          borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
        },
      }}
    >
      {/* Imagen y controles superiores */}
      <Box sx={{ position: 'relative' }}>
        <Box
          component="div"
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <Chip
          label={chipLabel}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(255,255,255,0.8)',
            fontSize: '0.65rem',
            fontWeight: 500,
            textTransform: 'capitalize',
            pointerEvents: 'none',
          }}
        />

        {selectionMode && (
          <Checkbox
            checked={isSelected(property.id)}
            onChange={handleSelect}
            size="medium"
            sx={{ position: 'absolute', bottom: 8, left: 8, p: 0 }}
            inputProps={{ 'aria-label': 'Seleccionar propiedad' }}
          />
        )}
        <Box sx={{ position: 'absolute', top: -5, right: -5 }}>
          <FavoriteButton propertyId={property.id} />
        </Box>
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
        {/* Área reservada para título: centrado verticalmente */}
        <Box sx={{ minHeight: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, lineHeight: '1.3rem', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {property.title}
          </Typography>
        </Box>

        {/* Cuadro(s) de Precio y Expensas */}
        <Box sx={{ mb: '0.5rem' }}>
          {property.showPrice ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ flex: 1, p: 0.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Precio</Typography>
                <Typography variant="subtitle2">{`${property.currency} $${property.price}`}</Typography>
              </Box>
              <Box sx={{ flex: 1, p: 0.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Expensas</Typography>
                <Typography variant="subtitle2">{property.expenses > 0 ? `${property.currency} $${property.expenses}` : 'No'}</Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 0.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Precio - Expensas</Typography>
              <Typography variant="subtitle2">Consultar</Typography>
            </Box>
          )}
        </Box>

        {/* Barra de métricas */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SquareFootIcon fontSize="small" />
            <Typography variant="caption">{`${property.area} m²`}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ViewComfyIcon fontSize="small" />
            <Typography variant="caption">{`${property.rooms}`}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HotelIcon fontSize="small" />
            <Typography variant="caption">{`${property.bedrooms}`}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BathtubIcon fontSize="small" />
            <Typography variant="caption">{`${property.bathrooms}`}</Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};
