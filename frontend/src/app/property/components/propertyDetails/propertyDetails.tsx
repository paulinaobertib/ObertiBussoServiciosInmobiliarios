/* src/app/property/components/propertyDetails/PropertyDetails.tsx */
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import ImageCarousel from './PropertyCarousel';
import PropertyInfo from './PropertyInfo';
import { Property } from '../../types/property';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Leaflet icon
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

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { neighborhoodsList } = usePropertyCrud();

  // Encuentra el barrio completo por ID
  const neighborhood =
    neighborhoodsList.find(n => n.id === property.neighborhoodId) || null;

  // Coordendas: null mientras carga; fallback después
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    const address = neighborhood
      ? `${neighborhood.name}, ${neighborhood.city}`
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
  }, [neighborhood]);

  // Construir la URL de Google Maps
  const googleMapsUrl = neighborhood
    ? `https://www.google.com/maps?q=${encodeURIComponent(
      `${neighborhood.name}, ${neighborhood.city}`
    )}`
    : `https://www.google.com/maps?q=Buenos+Aires,+Argentina`;

  // URLs de imágenes (sin File/URL.createObjectURL)
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
      {/* Carrusel + Info */}
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

      {/* Mapa */}
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
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={coordinates} icon={customMarkerIcon}>
              <Popup>
                {neighborhood?.name}, {neighborhood?.city}
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </Box>
    </Container>
  );
}
