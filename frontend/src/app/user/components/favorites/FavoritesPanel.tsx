import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useFavorites } from '../../hooks/useFavorites';
import { getPropertyById } from '../../../property/services/property.service';
import { Property } from '../../../property/types/property';
import { PropertyCard } from '../../../property/components/catalog/PropertyCard';

export const FavoritesPanel = () => {
  const navigate = useNavigate();
  const { favorites, loading: favLoading } = useFavorites();

  const [favoriteProps, setFavoriteProps] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (favorites.length === 0) {
      setFavoriteProps([]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        // 1) Traemos raw = lo que devuelva el servicio
        const rawResults = await Promise.all(
          favorites.map(f =>
            getPropertyById(f.propertyId)
              .then(r => {
                console.log('raw getPropertyById(', f.propertyId, ')=', r);
                return (r as any).data ?? r;
              })
              .catch(err => {
                console.warn('Falló getPropertyById(', f.propertyId, '):', err);
                return null;
              })
          )
        );

        if (!mounted) return;

        // 2) Filtramos nulos/indefinidos y objetos sin id
        const valid = rawResults.filter(
          (p): p is Property => !!p && typeof (p as any).id === 'number'
        ) as Property[];

        setFavoriteProps(valid);
      } catch (e) {
        console.error('Error cargando favoritos:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [favorites]);

  // Spinner mientras carga favoritos o sus propiedades
  if (favLoading || loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(clamp(120px,15vw,150px),1fr))',
        gap: 2,
        alignContent: 'start',
        p: 2,
      }}
    >
      {favoriteProps.length === 0 ? (
        <Typography
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            gridColumn: '1 / -1',
          }}
        >
          No tienes favoritos aún.
        </Typography>
      ) : (
        favoriteProps.map(prop => (
          <PropertyCard
            key={prop.id}
            property={prop}
            onClick={() => navigate(`/properties/${prop.id}`)}
          />
        ))
      )}
    </Box>
  );
};