import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import ImageCarousel from './PropertyCarousel';
import PropertyInfoCompare from './PropertyInfoCompare';
import { Property } from '../../types/property';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
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

interface PropertyDetailsCompareProps {
  comparisonItems: Property[];
}

export default function PropertyDetailsCompare({ comparisonItems }: PropertyDetailsCompareProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [coords, setCoords] = useState<([number, number] | null)[]>([null, null]);

  useEffect(() => {
    comparisonItems.forEach((property, idx) => {
    const address = property.neighborhood
      ? `${property.street}, ${property.neighborhood.name}, ${property.neighborhood.city}`
      : `${property.street}, Buenos Aires, Argentina`;

      const fetchCoordinates = async () => {
        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: address, format: 'json', limit: 1, countrycodes: 'ar' },
          });
          if (response.data.length) {
            const { lat, lon } = response.data[0];
            setCoords(prev => {
              const updated = [...prev];
              updated[idx] = [parseFloat(lat), parseFloat(lon)];
              return updated;
            });
          }
        } catch (error) {
          console.error('Error fetching coordinates:', error);
        }
      };

      fetchCoordinates();
    });
  }, [comparisonItems]);

  if (comparisonItems.length < 2 || comparisonItems.length > 3) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Selecciona 2 o 3 propiedades para comparar.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 8, px: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : comparisonItems.length === 3
            ? 'repeat(3, minmax(350px, 1fr))' // Columnas más anchas para 3 propiedades
            : 'repeat(2, minmax(400px, 1fr))', // Mantener 2 propiedades o ajustar
          gap: isMobile ? 1 : 3, // Aumentar espacio a 3 para no móviles, mantener 1 para móviles
        }}
      >
        {comparisonItems.map((property, idx) => {
          const center = coords[idx];

          const mainImage =
            typeof property.mainImage === 'string'
              ? property.mainImage
              : (property.mainImage as any).url;

          const galleryUrls = property.images.map(img =>
            typeof img === 'string' ? img : (img as any).url
          );

          const carouselImgs = galleryUrls.map((url, i) => ({ id: i, url }));

          const gmUrl = property.neighborhood
            ? `https://www.google.com/maps?q=${encodeURIComponent(
                `${property.neighborhood.name}, ${property.neighborhood.city}, Argentina`
              )}`
            : `https://www.google.com/maps?q=${encodeURIComponent(
                `${property.street} ${property.number}, Buenos Aires, Argentina`
              )}`;

          return (
            <Box
              key={property.id}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  border: 1,
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: '#ffe0b2',
                }}
              >
                <ImageCarousel images={carouselImgs} mainImage={mainImage} title={property.title} />
                <Box p={2}>
                  <PropertyInfoCompare property={property} />
                </Box>
              </Box>

              {/* Mapa separado, fuera de la card naranja */}
              {center ? (
                <Box
                  sx={{ height: 300, mt: 2, borderRadius: 2, overflow: 'hidden', boxShadow: 1, cursor: 'pointer' }}
                  onClick={() => window.open(gmUrl, '_blank')}
                >
                  <MapContainer center={center} zoom={15} style={{ width: '100%', height: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="© OpenStreetMap contributors"
                    />
                    <Marker position={center} icon={customMarkerIcon}>
                      <Popup>
                        {property.neighborhood
                          ? `${property.neighborhood.name}, ${property.neighborhood.city}`
                          : `${property.street} ${property.number}, Buenos Aires`}
                      </Popup>
                    </Marker>
                    <Circle
                      center={center}
                      radius={300}
                      pathOptions={{
                        stroke: false,
                        fillColor: '#1565c0',
                        fillOpacity: 0.3,
                      }}
                    />
                  </MapContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 300,
                    mt: 2,
                    borderRadius: 2,
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    boxShadow: 1,
                  }}
                >
                  Ubicación no encontrada.
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}