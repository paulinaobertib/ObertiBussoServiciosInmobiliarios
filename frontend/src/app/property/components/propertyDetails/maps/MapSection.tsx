import { useEffect, useState } from "react";
import { Box, Button, useTheme, CircularProgress, Typography } from "@mui/material";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

interface Props {
  address: string;
}

export const MapSection = ({ address }: Props) => {
  const theme = useTheme();
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCoords(null);
    axios
      .get("https://nominatim.openstreetmap.org/search", {
        params: { q: address, format: "json", limit: 1, countrycodes: "ar" },
      })
      .then((r) => {
        if (r.data.length) {
          const { lat, lon } = r.data[0];
          setCoords([+lat, +lon]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [address]);

  const gm = coords
    ? `https://www.google.com/maps?q=${coords[0]},${coords[1]}`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}`;

  return (
    <Box
      sx={{
        mt: 4,
        height: 400,
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {loading ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#fff",
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : coords ? (
        <>
          <MapContainer center={coords} zoom={15} style={{ width: "100%", height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Circle
              center={coords}
              radius={300}
              pathOptions={{
                stroke: false,
                fillColor: theme.palette.secondary.main,
                fillOpacity: 0.3,
              }}
            />
          </MapContainer>
          <Button
            variant="contained"
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "#fff",
              color: "text.primary",
              zIndex: 1000,
            }}
            onClick={() => window.open(gm, "_blank")}
          >
            Abrir en Maps
          </Button>
        </>
      ) : (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#fff",
            color: "text.secondary",
          }}
        >
          <Typography>Ubicación no encontrada.</Typography>
        </Box>
      )}
    </Box>
  );
};
