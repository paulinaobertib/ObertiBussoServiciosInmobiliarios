import { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Grid,
  InputAdornment,
  Typography,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { MapContainer, TileLayer, Circle, useMapEvents, GeoJSON } from "react-leaflet";
import { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getNeighborhoodById } from "../../../services/neighborhood.service";
import * as turf from "@turf/turf";

export interface AddressSelectorProps {
  neighborhoodId: number;
  neighborhoodName: string;
  value: { street: string; number: string };
  onChange: (v: { street: string; number: string }) => void;
}

export const AddressSelector = ({ neighborhoodId, neighborhoodName, value, onChange }: AddressSelectorProps) => {
  const theme = useTheme();
  const [openMap, setOpenMap] = useState(false);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [boundary, setBoundary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!neighborhoodId) return;
    setLoading(true);
    Promise.all([
      getNeighborhoodById(neighborhoodId),
      fetch(
        `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: `${neighborhoodName}, Argentina`,
            format: "json",
            limit: "1",
            polygon_geojson: "1",
            countrycodes: "ar",
          }).toString()
      ).then((r) => r.json()),
    ])
      .then(([dto, nominatim]) => {
        setCenter([dto.latitude, dto.longitude]);
        if (Array.isArray(nominatim) && nominatim[0]?.geojson) {
          setBoundary(nominatim[0].geojson);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [neighborhoodId, neighborhoodName]);

  const checkPointInBoundary = (lat: number, lng: number): boolean | null => {
    if (!boundary) return null;
    const pt = turf.point([lng, lat]);
    if (boundary.type === "Polygon") {
      const poly = turf.polygon(boundary.coordinates as number[][][]);
      return turf.booleanPointInPolygon(pt, poly);
    } else if (boundary.type === "MultiPolygon") {
      return (boundary.coordinates as number[][][][]).some((coords) => {
        const poly = turf.polygon(coords);
        return turf.booleanPointInPolygon(pt, poly);
      });
    }
    return null;
  };

  useEffect(() => {
    if (openMap) {
      const street = value.street.trim();
      const num = value.number.trim();
      if (!street && !num) {
        setMarkerPos(null);
        setIsValidAddress(null);
      } else {
        const addr = `${street} ${num}, ${neighborhoodName}`;
        fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({ q: addr, format: "json", limit: "1", countrycodes: "ar" }).toString()
        )
          .then((r) => r.json())
          .then((data: any[]) => {
            if (data.length) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              setMarkerPos([lat, lng]);
              setIsValidAddress(checkPointInBoundary(lat, lng));
            } else {
              setIsValidAddress(false);
            }
          })
          .catch(() => setIsValidAddress(false));
      }
    }
  }, [value.street, value.number, openMap, neighborhoodName, boundary]);

  function ClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPos([lat, lng]);
        fetch(
          `https://nominatim.openstreetmap.org/reverse?` +
            new URLSearchParams({ lat: String(lat), lon: String(lng), format: "json" }).toString()
        )
          .then((r) => r.json())
          .then((data: any) => {
            let road = data.address.road;
            let house = data.address.house_number;

            if (!road || road.trim() === "") road = "Sin nombre";
            if (!house || house.trim() === "") house = "S/N";

            onChange({ street: road, number: house });
            setIsValidAddress(checkPointInBoundary(lat, lng));
          })
          .catch(() => setIsValidAddress(false));
      },
    });
    return null;
  }

  if (loading) return <CircularProgress size={24} />;

  return (
    <>
      <Grid container spacing={1.5} columns={12} alignItems="center">
        <Grid size={{ xs: 8 }}>
          <TextField
            label="Calle"
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
            fullWidth
            size="small"
            required
            disabled={openMap}
            InputProps={{
              endAdornment:
                isValidAddress == null ? null : isValidAddress ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <ErrorIcon color="error" fontSize="small" />
                ),
            }}
          />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <TextField
            label="Número"
            value={value.number}
            onChange={(e) => onChange({ ...value, number: e.target.value })}
            fullWidth
            size="small"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onChange({ ...value, number: "S/N" })}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid size={{ xs: 1 }}>
          <IconButton size="small" onClick={() => setOpenMap(true)}>
            <MapIcon />
          </IconButton>
        </Grid>
      </Grid>
      {/* Alert below inputs */}
      {isValidAddress === false && (
        <Box sx={{ mt: 0, mx: 1 }}>
          <Typography color="error" variant="body2">
            La dirección no está dentro del barrio.
          </Typography>
        </Box>
      )}
      {isValidAddress === true && (
        <Box sx={{ mt: 1, mx: 1 }}>
          <Typography color="success.main" variant="body2">
            Dirección válida dentro del barrio.
          </Typography>
        </Box>
      )}

      <Dialog open={openMap} onClose={() => setOpenMap(false)} fullWidth maxWidth="md">
        <DialogTitle>Seleccionar ubicación en el mapa</DialogTitle>
        <DialogContent>
          {center && (
            <Box sx={{ mt: 2, height: 400, borderRadius: 2, overflow: "hidden", position: "relative" }}>
              <MapContainer center={center} zoom={15} style={{ width: "100%", height: "100%" }} ref={mapRef}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {boundary && (
                  <GeoJSON
                    data={boundary}
                    style={{
                      // quita el relleno:
                      fill: false,
                      // (opcional) quita el borde
                      stroke: false,
                    }}
                  />
                )}
                <ClickHandler />
                {markerPos && (
                  <Circle
                    center={markerPos}
                    radius={300}
                    pathOptions={{ stroke: false, fillColor: theme.palette.secondary.main, fillOpacity: 0.3 }}
                  />
                )}
              </MapContainer>
            </Box>
          )}
          <Box mt={2}>
            <Grid container spacing={1} alignItems="center">
              <Grid size={{ xs: 8 }}>
                <TextField
                  label="Calle seleccionada"
                  value={value.street}
                  onChange={(e) => onChange({ ...value, street: e.target.value })}
                  fullWidth
                  size="small"
                  required
                  InputProps={{
                    endAdornment:
                      isValidAddress == null ? null : isValidAddress ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <ErrorIcon color="error" fontSize="small" />
                      ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  label="Número"
                  value={value.number}
                  onChange={(e) => onChange({ ...value, number: e.target.value })}
                  fullWidth
                  size="small"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => onChange({ ...value, number: "S/N" })}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            {openMap &&
              (isValidAddress === false ? (
                <Typography color="error" variant="body2" sx={{ mt: 0, mx: 1 }}>
                  La dirección no está dentro del barrio.
                </Typography>
              ) : isValidAddress === true ? (
                <Typography color="success.main" variant="body2" sx={{ mt: 1, mx: 1 }}>
                  Dirección válida dentro del barrio.
                </Typography>
              ) : null)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMap(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (markerPos && mapRef.current) mapRef.current.flyTo(markerPos, 15);
              setOpenMap(false);
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
