import { useEffect, useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import { deleteProperty } from '../services/property.service';
import { Property } from '../types/property';
import { useGlobalAlert } from '../context/AlertContext';
import { useConfirmDialog } from '../utils/ConfirmDialog';
import { usePropertyCrud } from '../context/PropertiesContext';

export type CatalogMode = 'normal' | 'edit' | 'delete';

interface CatalogProps {
  mode: CatalogMode;
  onFinishAction: () => void;

  properties?: Property[];
  selectionMode?: boolean;
  selectedPropertyIds?: number[];
  toggleSelection?: (id: number) => void;
  isSelected?: (id: number) => boolean;
}

function PropertyCatalog({
  mode,
  onFinishAction,
  properties = [],
  selectionMode = false,
  toggleSelection = () => { },
  isSelected = () => false,
}: CatalogProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showAlert } = useGlobalAlert();
  const { ask, DialogUI } = useConfirmDialog();

  const [internalProperties, setInternalProperties] = useState<Property[]>([]);
  const { propertiesList, propertiesLoading, refreshProperties } = usePropertyCrud();

  useEffect(() => {
    if (properties.length > 0) {
      setInternalProperties(properties);
    } else {
      setInternalProperties(propertiesList);
    }
  }, [properties]);

  const handleCrudClick = (property: Property) => {
    if (mode === 'edit') {
      navigate(`/properties/${property.id}/edit`);
      onFinishAction();
    } else if (mode === 'delete') {
      ask(
        `¿Eliminar "${property.title}"?`,
        async () => {
          try {
            await deleteProperty(property);
            showAlert('Propiedad eliminada con éxito!', 'success');
            await refreshProperties();
          } catch (error: any) {
            const message = error.response?.data ?? 'Error desconocido';
            showAlert(message, 'error');
          }
          onFinishAction();
        }
      );
    } else {
      navigate(`/properties/${property.id}`);
      onFinishAction();
    }
  };

  const handleSelectionClick = (e: MouseEvent, propertyId: number) => {
    e.stopPropagation();
    toggleSelection(propertyId);
  };

  if (propertiesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  // 2) Si ya cargó y no hay datos
  if (!propertiesLoading && internalProperties.length === 0) {
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
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' },
            gap: 3,
          }}
        >
          {internalProperties.map((property) => {
            const imageSrc =
              typeof property.mainImage === 'string'
                ? property.mainImage
                : URL.createObjectURL(property.mainImage);

            const hoverBg =
              mode === 'edit'
                ? theme.palette.primary.light
                : mode === 'delete'
                  ? theme.palette.error.light
                  : undefined;

            return (
              <Card
                key={property.id}
                onClick={() =>
                  selectionMode
                    ? undefined
                    : handleCrudClick(property)
                }
                sx={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: 'transform 0.2s, background-color 0.2s',
                  border: mode !== 'normal' ? '2px solid' : 0,
                  borderColor:
                    mode === 'edit'
                      ? theme.palette.primary.main
                      : mode === 'delete'
                        ? theme.palette.error.main
                        : 'transparent',
                  borderStyle: 'solid',
                  cursor:
                    selectionMode || mode !== 'normal'
                      ? 'pointer'
                      : 'pointer',
                  '&:hover': mode !== 'normal' || selectionMode
                    ? {
                      backgroundColor: selectionMode
                        ? theme.palette.action.hover
                        : hoverBg,
                      transform: mode !== 'normal' ? 'scale(1.01)' : undefined,
                    }
                    : {},
                }}
              >
                <Box
                  component="div"
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    backgroundImage: `url(${imageSrc})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                />

                <Chip
                  label={property.status ?? 'Sin Estado'}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: { xs: 6, sm: 8 },
                    left: { xs: 6, sm: 10 },
                    zIndex: 5,
                    fontWeight: 600,
                    fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.875rem' },
                    px: { xs: 0.5, sm: 1 },
                    py: { xs: 0, sm: 0.5 },
                    borderRadius: 3,
                    boxShadow: 3,
                    bgcolor: '#e0e0e0',
                    color: '#0a0a0a',
                    pointerEvents: 'none',
                  }}
                />

                <CardContent
                  sx={{
                    textAlign: 'center',
                    backgroundColor: '#fed7aa',
                    flexGrow: 1,
                    p: { xs: 1, sm: 2, md: 3 },
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                >
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                    }}
                  >
                    {property.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    }}
                  >
                    {property.showPrice
                      ? `$${property.price.toLocaleString('es-AR')} ${property.currency}`
                      : 'Consultar precio'}
                  </Typography>
                </CardContent>

                {selectionMode && (
                  <Box
                    onClick={(e) => handleSelectionClick(e, property.id)}
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
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'background-color 0.3s',
                      zIndex: 10,
                    }}
                  >
                    {isSelected(property.id) && (
                      <CheckIcon sx={{ color: '#fff', fontSize: 20 }} />
                    )}
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
}

export default PropertyCatalog;
