import React, { useEffect, useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  CircularProgress,
  useTheme,
  IconButton,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { deleteProperty } from '../services/property.service';
import { Property } from '../types/property';
import { useGlobalAlert } from '../context/AlertContext';
import { useConfirmDialog } from '../utils/ConfirmDialog';
import { usePropertyCrud } from '../context/PropertiesContext';
import { useAuthContext } from '../../user/context/AuthContext';

export type CatalogMode = 'normal' | 'edit' | 'delete';

interface CatalogProps {
  mode: CatalogMode;
  onFinishAction: () => void;
  properties?: Property[];
  selectionMode?: boolean;
  toggleSelection?: (id: number) => void;
  isSelected?: (id: number) => boolean;
}

const PropertyCatalog: React.FC<CatalogProps> = ({
  mode,
  onFinishAction,
  properties = [],
  selectionMode = false,
  toggleSelection = () => { },
  isSelected = () => false,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showAlert } = useGlobalAlert();
  const { ask, DialogUI } = useConfirmDialog();
  const { propertiesList, loading, refreshProperties } = usePropertyCrud();
  const [internalProperties, setInternalProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const { isLogged } = useAuthContext();


  useEffect(() => {
    setInternalProperties(properties.length ? properties : propertiesList);
  }, [properties, propertiesList]);

  const toggleFavorite = (id: number) => {
    if (!isLogged) {
      showAlert('Para guardar como favorita esta propiedad, iniciá sesión', 'info');
      return;
    }
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCrudClick = (prop: Property) => {
    if (mode === 'edit') {
      navigate(`/properties/${prop.id}/edit`);
      onFinishAction();
    } else if (mode === 'delete') {
      ask(`¿Eliminar "${prop.title}"?`, async () => {
        try {
          await deleteProperty(prop);
          showAlert('Propiedad eliminada con éxito!', 'success');
          await refreshProperties();
        } catch (e: any) {
          showAlert(e.response?.data ?? 'Error desconocido', 'error');
        }
        onFinishAction();
      });
    } else {
      navigate(`/properties/${prop.id}`);
      onFinishAction();
    }
  };

  const handleSelect = (e: MouseEvent, id: number) => {
    e.stopPropagation();
    toggleSelection!(id);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }
  if (!loading && !internalProperties.length) {
    return (
      <Typography sx={{ mt: 10, textAlign: 'center', color: 'text.secondary' }}>
        No hay propiedades disponibles.
      </Typography>
    );
  }

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))',
            gap: 3,
          }}
        >
          {internalProperties.map(property => {
            const src =
              typeof property.mainImage === 'string'
                ? property.mainImage
                : URL.createObjectURL(property.mainImage);

            const isFav = favorites[property.id] ?? false;

            return (
              <Card
                key={property.id}
                onClick={() => (!selectionMode ? handleCrudClick(property) : undefined)}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: 2,
                  '&:hover': {
                    transform: mode !== 'normal' ? 'scale(1.01)' : undefined,
                    backgroundColor:
                      mode !== 'normal'
                        ? theme.palette.action.hover
                        : undefined,
                  },
                  transition: 'transform 0.2s, background-color 0.2s',
                }}
              >
                {/* corazón arriba derecha */}
                <IconButton
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    toggleFavorite(property.id);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    zIndex: 10,
                  }}
                >
                  {isFav ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon color="error" />}
                </IconButton>

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

                {/* label estado */}
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

                <CardContent
                  sx={{
                    textAlign: 'center',
                    backgroundColor: '#fed7aa',
                    p: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{ fontSize: 'clamp(0.875rem,2vw,1.25rem)' }}
                  >
                    {property.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: 'clamp(0.75rem,1.5vw,1rem)' }}
                  >
                    {property.showPrice
                      ? `$${property.price.toLocaleString('es-AR')} ${property.currency}`
                      : 'Consultar precio'}
                  </Typography>
                </CardContent>

                {selectionMode && (
                  <Box
                    onClick={e => handleSelect(e, property.id)}
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      border: `2px solid ${theme.palette.primary.main}`,
                      backgroundColor: isSelected!(property.id)
                        ? theme.palette.primary.main
                        : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10,
                    }}
                  >
                    {isSelected!(property.id) && <CheckIcon sx={{ color: '#fff' }} />}
                  </Box>
                )}
              </Card>
            );
          })}
        </Box>
      </Box>
      {DialogUI}
    </>
  );
};

export default PropertyCatalog;
