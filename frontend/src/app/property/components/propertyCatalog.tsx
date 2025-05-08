import { Box, Card, CardMedia, CardContent, Typography, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import { Property } from '../types/property';

type PropertyCatalogProps = {
  properties?: Property[];
  selectionMode?: boolean;
  selectedPropertyIds?: number[];
  toggleSelection?: (id: number) => void;
  isSelected?: (id: number) => boolean;
};

const PropertyCatalog = ({
  properties = [],
  selectionMode = false,
  toggleSelection = () => {},
  isSelected = () => false,
}: PropertyCatalogProps) => {
  const navigate = useNavigate();

  const handleCardClick = (propertyId: number) => {
    if (!selectionMode) {
      navigate(`/properties/${propertyId}`);
    }
  };

  const handleSelectionClick = (e: React.MouseEvent, propertyId: number) => {
    e.stopPropagation();
    console.log(`Handling selection click for ID ${propertyId}`);
    toggleSelection(propertyId);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {properties.map((property) => {
        const propertyId = property.id;

        return (
          <Card
            key={propertyId}
            sx={{
              width: { xs: '100%', sm: 360, md: 500 },
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: 2,
              position: 'relative',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4,
                zIndex: 1,
              },
              cursor: selectionMode ? 'default' : 'pointer',
            }}
            onClick={() => handleCardClick(propertyId)}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="250"
                image={property.mainImage || '/default-image.jpg'}
                alt={property.title || 'Propiedad'}
                sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
              />
              <Chip
                label={property.status || 'Sin Estado'}
                color="default"
                size="medium"
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  fontWeight: 'bold',
                  fontSize: { xs: '12px', sm: '17px' },
                  borderRadius: 3,
                  boxShadow: 3,
                  backgroundColor: '#e0e0e0',
                  color: '#0a0a0a',
                }}
              />
            </Box>

            <CardContent
              sx={{
                textAlign: 'center',
                backgroundColor: '#fed7aa',
                flexGrow: 1,
                padding: { xs: 1, sm: 2 },
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                {property.title || 'Propiedad'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ${property.price ? property.price.toLocaleString() : '0'} USD
              </Typography>
            </CardContent>

            {selectionMode && (
              <Box
                onClick={(e) => handleSelectionClick(e, propertyId)}
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  width: 28,
                  height: 28,
                  borderRadius: '4px',
                  border: '2px solid #000',
                  backgroundColor: isSelected(propertyId) ? '#e65100' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'background-color 0.3s',
                }}
              >
                {isSelected(propertyId) && (
                  <CheckIcon sx={{ color: '#fff', fontSize: 20 }} />
                )}
              </Box>
            )}
          </Card>
        );
      })}
    </Box>
  );
};

export default PropertyCatalog;