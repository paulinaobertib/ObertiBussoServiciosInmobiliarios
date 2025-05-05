import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { getAllProperties } from '../services/propertyService';
import CompareButtonFloating from '../components/buttonCompare';

const Home: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);

  const toggleSelection = (id: number) => {
    setSelectedPropertyIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else if (prev.length < 2) {
        return [...prev, id];
      } else {
        return [...prev.slice(1), id];
      }
    });
  };

  const isSelected = (id: number) => selectedPropertyIds.includes(id);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await getAllProperties();
        if (Array.isArray(response?.data)) {
          setProperties(response.data);
        } else if (Array.isArray(response)) {
          setProperties(response);
        } else {
          console.error('Estructura inesperada de respuesta:', response);
          setProperties([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (!loading && properties.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <Typography variant="h5" color="text.secondary">
          No se encontraron propiedades.
        </Typography>
      </Box>
    );
  }

  const handleCompareClick = () => {
    console.log('Comparar propiedades:', selectedPropertyIds);

  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          gap: 3,
          pl: { md: 16 },
        }}
      >
        {properties.map((property, index) => {
          const propertyId = property.id ?? index;

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
              }}
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

              <Box
                onClick={() => toggleSelection(propertyId)}
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
            </Card>
          );
        })}
      </Box>

      <CompareButtonFloating
        onClick={handleCompareClick}
        selectedCount={selectedPropertyIds.length}
      />
    </Box>
  );
};

export default Home;
