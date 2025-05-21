import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import ImageCarousel from './PropertyCarousel'; 
import PropertyInfo from './PropertyInfo';
import { Property } from '../../types/property';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState } from 'react';
import axios from 'axios';

const customMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
          cursor: 'pointer',
        }}
        onClick={() => window.open(googleMapsUrl, '_blank')}
      >
        {coordinates ? (
          <MapContainer
            center={coordinates}
            zoom={15}
            style={{ width: '100%', height: 400 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            <Marker position={coordinates} icon={customMarkerIcon}>
              <Popup>
                {address}
              </Popup>
            </Marker>
          </MapContainer>
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
