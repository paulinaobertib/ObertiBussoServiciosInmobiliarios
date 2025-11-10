import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { loadGoogleMapsSdk } from "../../../utils/googleMapsLoader";

interface Props {
  formattedAddress?: string;
  placeId?: string;
  latitude?: number | null;
  longitude?: number | null;
}

// Función para agregar ruido aleatorio a las coordenadas (aproximadamente 100-200 metros)
const addRandomOffset = (coord: number): number => {
  // Offset de ~0.001 grados = aproximadamente 100 metros
  const offset = (Math.random() - 0.5) * 0.005; // Entre -0.0015 y +0.0015
  return parseFloat((coord + offset).toFixed(4)); // Solo 4 decimales para menos precisión
};

export const MapSection = (props: Props) => {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const circleRef = useRef<any | null>(null);
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

        // Aplicar offset aleatorio a las coordenadas para proteger la privacidad
        const approxLat = addRandomOffset(props.latitude!);
        const approxLng = addRandomOffset(props.longitude!);
        const center = { lat: approxLat, lng: approxLng };

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new googleMaps.maps.Map(mapNodeRef.current, {
            center,
            zoom: 16, // Zoom más alejado para mostrar el área general
            disableDefaultUI: false,
            mapTypeControl: false,
            streetViewControl: false,
          });
        } else {
          mapInstanceRef.current.setCenter(center);
          mapInstanceRef.current.setZoom(16);
        }

        // Dibujar un círculo grande que cubra aproximadamente 300 metros de radio
        if (circleRef.current) {
          circleRef.current.setMap(null);
        }

        circleRef.current = new googleMaps.maps.Circle({
          strokeColor: "#EB7333",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#EB7333",
          fillOpacity: 0.25,
          map: mapInstanceRef.current,
          center,
          radius: 300, // 300 metros de radio
        });

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
          <Typography variant="body2" color="text.secondary">
            Cargando mapa...
          </Typography>
        </Box>
      )}
    </Box>
  );
};
