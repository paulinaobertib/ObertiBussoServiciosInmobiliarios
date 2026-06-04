import { Box, Typography, CircularProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { loadGoogleMapsSdk } from "../../../utils/googleMapsLoader";

interface Props {
  formattedAddress?: string;
  placeId?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export const MapSection = (props: Props) => {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Validar que tengamos coordenadas
    if (!props.latitude || !props.longitude) {
      setLoading(false);
      setError(true);
      return;
    }

    // Validar que el nodo del DOM exista
    if (!mapNodeRef.current) {
      setLoading(false);
      setError(true);
      console.error("Map node not available");
      return;
    }

    setLoading(true);
    setError(false);

    loadGoogleMapsSdk()
      .then((googleMaps) => {
        // Verificar nuevamente después de la carga asíncrona
        if (!mapNodeRef.current) {
          console.error("Map node disappeared during SDK load");
          setError(true);
          setLoading(false);
          return;
        }

        // Ubicación exacta de la propiedad
        const center = { lat: props.latitude!, lng: props.longitude! };

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new googleMaps.maps.Map(mapNodeRef.current, {
            center,
            zoom: 17,
            disableDefaultUI: false,
            mapTypeControl: false,
            streetViewControl: false,
          });
        } else {
          mapInstanceRef.current.setCenter(center);
          mapInstanceRef.current.setZoom(17);
        }

        // Marcador en la dirección exacta
        if (!markerRef.current) {
          markerRef.current = new googleMaps.maps.Marker({
            map: mapInstanceRef.current,
            position: center,
            title: props.formattedAddress,
          });
        } else {
          markerRef.current.setPosition(center);
          markerRef.current.setMap(mapInstanceRef.current);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading Google Maps:", err);
        setError(true);
        setLoading(false);
      });
  }, [props.latitude, props.longitude]);

  if (error || !props.latitude || !props.longitude) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Ubicación no disponible para esta propiedad.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: 4,
        height: 400,
        borderRadius: 2,
        overflow: "hidden",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        position: "relative",
      }}
    >
      <Box ref={mapNodeRef} sx={{ width: "100%", height: "100%" }} />
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(245, 245, 245, 0.9)",
          }}
        >
          <CircularProgress aria-label="Cargando mapa" />
        </Box>
      )}
    </Box>
  );
};
