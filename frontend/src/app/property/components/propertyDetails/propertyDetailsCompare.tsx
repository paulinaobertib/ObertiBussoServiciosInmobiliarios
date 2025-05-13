import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import ImageCarousel from './PropertyCarousel';
import PropertyInfo from '../propertyDetails/propertyInfoCompare';
import { Property } from '../../types/property';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Configurar íconos para Leaflet
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

  useEffect(() => {
    const address = property.neighborhood
      ? `${property.neighborhood.name}, ${property.neighborhood.city}`
      : 'Buenos Aires, Argentina';
    
    const fetchCoordinates = async () => {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
            params: {
              q: address,
              format: 'json',
              limit: 1,
            },
          }
        );
        if (response.data.length > 0) {
          const { lat, lon } = response.data[0];
          setCoordinates([parseFloat(lat), parseFloat(lon)]);
        }
      } catch (error) {
        console.error('Error al obtener las coordenadas:', error);
      }
    };

    fetchCoordinates();
  }, [property.neighborhood]);

  // Construir la URL de Google Maps
  const googleMapsUrl = property.neighborhood
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        `${property.neighborhood.name}, ${property.neighborhood.city}`
      )}`
    : `https://www.google.com/maps?q=Buenos+Aires,+Argentina`;

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
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: isMobile ? '100%' : '50%',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <ImageCarousel
            images={property.images}
            mainImage={property.mainImage}
            title={property.title}
          />
        </Box>
        <Box sx={{ width: isMobile ? '100%' : '50%' }}>
          <PropertyInfo property={property} />
        </Box>
      </Box>

      {/* Mapa debajo del cuadro naranja */}
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
        {coordinates && (
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
                {property.neighborhood?.name}, {property.neighborhood?.city}
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </Box>
    </Container>
  );
};

export default PropertyDetails;