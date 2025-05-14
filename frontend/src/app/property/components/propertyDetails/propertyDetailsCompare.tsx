/* src/app/property/components/propertyDetails/PropertyDetailsCompare.tsx */
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import ImageCarousel from './PropertyCarousel';
import PropertyInfo from './PropertyInfoCompare';
import { usePropertyCrud } from '../../context/PropertiesContext';
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

export default function PropertyDetailsCompare() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    comparisonItems,
    neighborhoodsList
  } = usePropertyCrud();

  // if not two, prompt
  if (comparisonItems.length !== 2) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Selecciona dos propiedades para comparar.
        </Typography>
      </Container>
    );
  }

  // Coordinates for each
  const [coords, setCoords] = useState<([number, number] | null)[]>([null, null]);

  // Preview image URLs
  const previewRefs = comparisonItems.map(() => ({
    main: useRef<string>(''), gallery: useRef<string[]>([]), urls: useRef<string[]>([])
  }));

  // Setup previews and coords
  comparisonItems.forEach((property, idx) => {
    // images preview
    useEffect(() => {
      const urls: string[] = [];
      // main
      const mainUrl =
        typeof property.mainImage === 'string'
          ? property.mainImage
          : property.mainImage instanceof File
            ? URL.createObjectURL(property.mainImage)
            : typeof (property.mainImage as any)?.url === 'string'
              ? (property.mainImage as any).url
              : '';
      if (property.mainImage instanceof File) urls.push(mainUrl);
      // gallery
      const galleryUrls = property.images.map(img => {
        // Si ya es URL string
        if (typeof img === 'string') return img;
        // Si es File
        if (img instanceof File) {
          const u = URL.createObjectURL(img);
          urls.push(u);
          return u;
        }
        // Si es objeto con propiedad url
        if (img && typeof img === 'object' && 'url' in img) {
          return (img as any).url;
        }
        // fallback vacío
        return '';
      });
      previewRefs[idx].main.current = mainUrl;
      previewRefs[idx].gallery.current = galleryUrls;
      previewRefs[idx].urls.current = urls;
      return () => {
        previewRefs[idx].urls.current.forEach(u => URL.revokeObjectURL(u));
      };
    }, [property.mainImage, property.images]);

    // geocode
    useEffect(() => {
      const nb = neighborhoodsList.find(n => n.id === property.neighborhoodId);
      if (!nb) return;
      const address = `${nb.name}, ${nb.city}, Argentina`;
      (async () => {
        try {
          const { data } = await axios.get(
            'https://nominatim.openstreetmap.org/search',
            { params: { q: address, format: 'json', limit: 1, countrycodes: 'ar' } }
          );
          if (Array.isArray(data) && data.length) {
            const { lat, lon } = data[0];
            setCoords(old => {
              const c = [...old]; c[idx] = [parseFloat(lat), parseFloat(lon)]; return c;
            });
          }
        } catch { }
      })();
    }, [property.neighborhoodId, neighborhoodsList]);
  });

  const defaultCoords: [number, number] = [-31.4135, -64.1811];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 4 }}>
        {comparisonItems.map((property, idx) => {
          const nb = neighborhoodsList.find(n => n.id === property.neighborhoodId);
          const center = coords[idx] ?? defaultCoords;
          const mainImage = previewRefs[idx].main.current;
          const galleryImages = previewRefs[idx].gallery.current;
          const carouselImgs = galleryImages.map((url, i) => ({ id: i, url }));
          const gmUrl = nb
            ? `https://www.google.com/maps?q=${encodeURIComponent(
              `${nb.name}, ${nb.city}, Argentina`
            )}`
            : undefined;

          return (
            <Box key={property.id} sx={{ flex: 1, border: 1, borderColor: 'grey.300', borderRadius: 2, overflow: 'hidden' }}>
              <ImageCarousel images={carouselImgs} mainImage={mainImage} title={property.title} />
              <Box p={2}><PropertyInfo property={property} /></Box>
              <Box sx={{ height: 300, cursor: gmUrl ? 'pointer' : 'default' }} onClick={() => gmUrl && window.open(gmUrl, '_blank')}>
                <MapContainer center={center} zoom={15} style={{ width: '100%', height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                  <Marker position={center} icon={customMarkerIcon}>
                    <Popup>{nb?.name}, {nb?.city}</Popup>
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
