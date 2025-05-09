// src/app/property/components/PropertyCatalog.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Typography,
  CircularProgress,
} from '@mui/material';

import { getAllProperties, deleteProperty } from '../services/property.service';
import { Property } from '../types/property';
import { useGlobalAlert } from '../context/AlertContext';
import { useConfirmDialog } from '../utils/ConfirmDialog';

export type CatalogMode = 'normal' | 'edit' | 'delete';

interface CatalogProps {
  mode: CatalogMode;
  onFinishAction: () => void;
}

function PropertyCatalog({ mode, onFinishAction }: CatalogProps) {
  const navigate = useNavigate();
  const { showAlert } = useGlobalAlert();
  const { ask, DialogUI } = useConfirmDialog();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [_, setError] = useState<string | null>(null);

  // Función para cargar el listado
  const fetchProperties = async () => {
    try {
      const response = await getAllProperties();
      const data = Array.isArray(response?.data) ? response.data : response;
      setProperties(data as Property[]);
    } catch (err) {
      console.error(err);
      setError('Error cargando propiedades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleClick = (property: Property) => {
    if (mode === 'edit') {
      navigate(`/properties/${property.id}/edit`);
      onFinishAction();
    } else if (mode === 'delete') {
      ask(
        `¿Deseas eliminar la propiedad "${property.title}"?`,
        async () => {
          try {
            await deleteProperty(property);
            showAlert('Propiedad eliminada correctamente', 'success');
            await fetchProperties();
          } catch {
            showAlert('Error al eliminar propiedad', 'error');
          }
          onFinishAction();
        }
      );
    } else {
      navigate(`/properties/${property.id}`);
      onFinishAction();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {properties.map((property) => {
            const imageSrc =
              typeof property.mainImage === 'string'
                ? property.mainImage
                : URL.createObjectURL(property.mainImage);

            return (
              <Card
                key={property.id}
                onClick={() => handleClick(property)}
                sx={{
                  position: 'relative',
                  width: { xs: '100%', sm: 360, md: 500 },
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 4,
                    zIndex: 1,
                  },
                  border: mode !== 'normal' ? 2 : 0,
                  borderColor:
                    mode === 'edit' ? 'primary.main' :
                      mode === 'delete' ? 'error.main' :
                        'transparent',
                  borderStyle: 'solid',
                }}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={imageSrc}
                  alt={property.title}
                  sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                />

                <Chip
                  label={property.status ?? 'Sin Estado'}
                  size="medium"
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 5,
                    fontWeight: 600,
                    fontSize: { xs: '12px', sm: '15px' },
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
                    p: { xs: 1, sm: 2 },
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                >
                  <Typography variant="h5" fontWeight={600} noWrap>
                    {property.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ${property.price?.toLocaleString('es-AR') ?? '0'} {property.currency}
                  </Typography>
                </CardContent>
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
