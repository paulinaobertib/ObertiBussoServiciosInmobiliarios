import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';

import { BasePage } from './BasePage';
import { PropertyCard } from '../app/property/components/catalog/PropertyCard';
import { useFavorites } from '../app/user/hooks/useFavorites';  // tu hook ya creado
import { usePropertyCrud } from '../app/property/context/PropertiesContext';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, loading: loadingFav } = useFavorites();
  const { propertiesList, loading: loadingProps } = usePropertyCrud();

  const loading = loadingFav || loadingProps;

  if (loading) {
    return (
      <BasePage maxWidth={false}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress size={48} />
        </Box>
      </BasePage>
    );
  }

  const favoriteProperties = propertiesList.filter(prop =>
    favorites.some(fav => fav.propertyId === prop.id)
  );

  return (
    <BasePage maxWidth={true}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Mis Favoritos
      </Typography>

      {favoriteProperties.length === 0 ? (
        <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
          No tienes favoritos aún.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 3,
            p: 2,
          }}
        >
          {favoriteProperties.map(prop => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onClick={() => navigate(`/properties/${prop.id}`)}
            />
          ))}
        </Box>
      )}
    </BasePage>
  );
}