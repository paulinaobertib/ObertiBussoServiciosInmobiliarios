import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useFavorites } from '../../hooks/useFavorites';
import { getPropertyById } from '../../../property/services/property.service';
import type { Property } from '../../../property/types/property';
import { CatalogList } from '../../../property/components/catalog/CatalogList';

export const FavoritesPanel = () => {
  const navigate = useNavigate();
  const { favorites, loading: favLoading } = useFavorites();
  const [favoriteProps, setFavoriteProps] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);

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

  const loading = favLoading || loadingProps;

  const availableFavorites = favoriteProps.filter(
    p => (p.status || '').trim().toLowerCase() === 'disponible'
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (availableFavorites.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No tienes favoritos disponibles.
        </Typography>
      </Box>
    );
  }

  return (
    <CatalogList
      properties={availableFavorites}
      onCardClick={prop => navigate(`/properties/${prop.id}`)}
    />
  );
};