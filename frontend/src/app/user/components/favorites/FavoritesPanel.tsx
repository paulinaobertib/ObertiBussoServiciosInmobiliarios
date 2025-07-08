import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import { usePropertyCrud } from '../../../property/context/PropertiesContext';
import { PropertyCard } from '../../../property/components/catalog/PropertyCard';

export const FavoritesPanel = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { propertiesList } = usePropertyCrud();
  const favoriteProperties = propertiesList.filter(prop =>
    favorites.some(fav => fav.propertyId === prop.id)
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(120px,15vw,150px),1fr))',
        gap: 2,
        alignContent: 'start',
        p: 2,
      }}
    >
      {favoriteProperties.length === 0 ? (
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
        favoriteProperties.map(prop => (
          <PropertyCard
            key={prop.id}
            property={prop}
            onClick={() => navigate(`/properties/${prop.id}`)}
          />
        ))
      )}
    </Box>
  );
}
