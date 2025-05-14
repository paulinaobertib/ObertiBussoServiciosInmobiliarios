/* src/app/property/components/propertyDetails/PropertyDetailsCompare.tsx */
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import ImageCarousel from './PropertyCarousel';
import PropertyInfoCompare from './propertyInfoCompare';
import { Property } from '../../types/property';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState, useRef } from 'react';
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

interface PropertyDetailsCompareProps {
  comparisonItems: Property[];
}

export default function PropertyDetailsCompare({ comparisonItems }: PropertyDetailsCompareProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Si no hay dos propiedades, mostramos mensaje
  if (comparisonItems.length !== 2) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Selecciona dos propiedades para comparar.
        </Typography>
      </Container>
    );
  }

  // Coordenadas para cada propiedad
  const [coords, setCoords] = useState<([number, number] | null)[]>([null, null]);

  // URLs de vista previa de imágenes
  const previewRefs = comparisonItems.map(() => ({
    main: useRef<string>(''),
    gallery: useRef<string[]>([]),
    urls: useRef<string[]>([]),
  }));

  // Configurar vistas previas y coordenadas
  comparisonItems.forEach((property, idx) => {
    // Vista previa de imágenes
    useEffect(() => {
      const urls: string[] = [];
      // Imagen principal
      const mainUrl =
        typeof property.mainImage === 'string'
          ? property.mainImage
          : URL.createObjectURL(property.mainImage);
      if (property.mainImage instanceof File) urls.push(mainUrl);

      // Imágenes de la galería
      const galleryUrls = property.images.map((img) => {
        if (typeof img === 'string') return img;
        const u = URL.createObjectURL(img);
        urls.push(u);
        return u;
      });

      previewRefs[idx].main.current = mainUrl;
      previewRefs[idx].gallery.current = galleryUrls;
      previewRefs[idx].urls.current = urls;

      return () => {
        urls.forEach((u) => URL.revokeObjectURL(u));
      };
    }, [property.mainImage, property.images]);

    // Geocodificación
    useEffect(() => {
      const address = property.neighborhood
        ? `${property.neighborhood.name}, ${property.neighborhood.city}, Argentina`
        : `Buenos Aires, Argentina`;

      const fetchCoordinates = async () => {
        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: address, format: 'json', limit: 1, countrycodes: 'ar' },
          });
          if (response.data.length) {
            const { lat, lon } = response.data[0];
            setCoords((old) => {
              const c = [...old];
              c[idx] = [parseFloat(lat), parseFloat(lon)];
              return c;
            });
          }
        } catch (error) {
          console.error('Error fetching coordinates:', error);
        }
      };

      fetchCoordinates();
    }, [property.neighborhood, property.street, property.number, idx]);
  });

  const defaultCoords: [number, number] = [-34.6037, -58.3816]; // Buenos Aires por defecto

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 4 }}>
        {comparisonItems.map((property, idx) => {
          const center = coords[idx] ?? defaultCoords;
          const mainImage = previewRefs[idx].main.current;
          const galleryImages = previewRefs[idx].gallery.current;
          const carouselImgs = galleryImages.map((url, i) => ({ id: i, url }));
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
              sx={{ flex: 1, border: 1, borderColor: 'grey.300', borderRadius: 2, overflow: 'hidden' }}
            >
              <ImageCarousel images={carouselImgs} mainImage={mainImage} title={property.title} />
              <Box p={2}>
                <PropertyInfoCompare property={property} /> {/* Cambiado a PropertyInfoCompare */}
              </Box>
              <Box
                sx={{ height: 300, cursor: gmUrl ? 'pointer' : 'default' }}
                onClick={() => gmUrl && window.open(gmUrl, '_blank')}
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
                </MapContainer>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}