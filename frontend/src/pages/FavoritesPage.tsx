import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';

import { BasePage } from './BasePage';
import { PropertyCard } from '../app/property/components/catalog/PropertyCard';
import { useFavorites } from '../app/user/hooks/useFavorites';
import { getPropertyById } from '../app/property/services/property.service';
import type { Property } from '../app/property/types/property';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, loading: loadingFav } = useFavorites();

  const [favoriteProps, setFavoriteProps] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);

  // Cada vez que cambian los favoritos, traemos sólo esas propiedades
  useEffect(() => {
    let mounted = true;
    if (favorites.length === 0) {
      setFavoriteProps([]);
      return;
    }
    setLoadingProps(true);
    (async () => {
      const results = await Promise.all(
        favorites.map(f =>
          getPropertyById(f.propertyId)
            .then(r => (r as any).data ?? r)
            .catch(() => null)
        )
      );
      if (!mounted) return;
      setFavoriteProps(
        results.filter((p): p is Property => !!p && typeof p.id === 'number')
      );
      setLoadingProps(false);
    })();
    return () => {
      mounted = false;
    };
  }, [favorites]);

  const loading = loadingFav || loadingProps;

  if (loading) {
    return (
      <BasePage>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress size={48} />
        </Box>
      </BasePage>
    );
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: 'absolute', top: 64, left: 8, zIndex: 1300 }}
      >
        <ReplyIcon />
      </IconButton>

      <BasePage maxWidth>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Mis Favoritos
        </Typography>

        {favoriteProps.length === 0 ? (
          <Typography
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mt: 4,
            }}
          >
            No tienes favoritos aún.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 3,
              p: 2,
            }}
          >
            {favoriteProps.map(prop => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onClick={() => navigate(`/properties/${prop.id}`)}
              />
            ))}
          </Box>
        )}
      </BasePage>
    </>
  );
}
