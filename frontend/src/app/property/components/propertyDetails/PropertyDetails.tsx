import { Box, Button, Container, useMediaQuery, useTheme } from '@mui/material';
import ImageCarousel from './PropertyCarousel';
import PropertyInfo from './PropertyInfo';
import { Property } from '../../types/property';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface PropertyDetailsProps {
  property: Property;
}

const PropertyDetails = ({ property }: PropertyDetailsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  const address = property.neighborhood
    ? `${property.street}, ${property.neighborhood.name}, ${property.neighborhood.city}`
    : `${property.street}, Buenos Aires, Argentina`;

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: address,
            format: 'json',
            limit: 1,
          },
        });
        if (response.data.length > 0) {
          const { lat, lon } = response.data[0];
          setCoordinates([parseFloat(lat), parseFloat(lon)]);
        }
      } catch (error) {
        console.error('Error al obtener las coordenadas:', error);
      }
    };

    fetchCoordinates();
  }, [address]);

  const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;

  const mainImageUrl =
    typeof property.mainImage === 'string'
      ? property.mainImage
      : (property.mainImage as any).url;
  const galleryUrls = property.images.map(img =>
    typeof img === 'string' ? img : (img as any).url
  );
  const carouselImages = galleryUrls.map((url, idx) => ({ id: idx, url }));

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box
        sx={{
          backgroundColor: '#ffe0b2',
          borderRadius: 2,
          p: 3,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ width: isMobile ? '100%' : '50%', flexShrink: 0 }}>
          <ImageCarousel
            images={carouselImages}
            mainImage={mainImageUrl}
            title={property.title}
          />
        </Box>
        <Box sx={{ width: isMobile ? '100%' : '50%' }}>
          <PropertyInfo property={property} />
        </Box>
      </Box>

      <Box
        sx={{
          mt: 4,
          width: '100%',
          maxWidth: '100%',
          mx: 'auto',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',  // para posicionar el botón
        }}
      >
        {coordinates ? (
          <>
            {/* Mapa interactivo */}
            <MapContainer
              center={coordinates}
              zoom={15}
              style={{ width: '100%', height: 400 }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Circle
                center={coordinates}
                radius={300}
                pathOptions={{ stroke: false, fillColor: '#1565c0', fillOpacity: 0.3 }}
              />
            </MapContainer>

            {/* Botón “Abrir en Maps” sobre el mapa */}
            <Button
              variant="contained"
              size="small"
              sx={{
                zIndex: 1000,
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'white',
                color: 'text.primary'
              }}
              onClick={() => window.open(googleMapsUrl, '_blank')}
            >
              Abrir en Maps
            </Button>
          </>
        ) : (
          <Box
            sx={{
              height: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              color: 'text.secondary',
              fontSize: '1.2rem',
              fontStyle: 'italic',
            }}
          >
            Ubicación no encontrada.
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default PropertyDetails;
