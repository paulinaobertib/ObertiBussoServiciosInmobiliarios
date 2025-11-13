import React from "react";
import { Box, Typography, Chip, Stack, Divider, useTheme } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HotelIcon from "@mui/icons-material/Hotel";
import BathtubIcon from "@mui/icons-material/Bathtub";
import DoorFrontIcon from "@mui/icons-material/DoorFront";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import FoundationIcon from "@mui/icons-material/Foundation";
import { Property } from "../../types/property";
import { formatPrice } from "../../utils/formatPrice";
import { formatPropertyAddress } from "../../utils/propertyLocation";
import { usePropertiesContext } from "../../context/PropertiesContext";

interface Props {
  property: Property;
}

type Amenity = string | { id?: string | number; name?: string; label?: string };

export const PropertyInfoCompare = ({ property }: Props) => {
  const theme = useTheme();
  const { comparisonItems } = usePropertiesContext();

  const labelOfAmenity = (a: Amenity) => (typeof a === "string" ? a : a.name ?? a.label ?? "");
  const keyOfAmenity = (a: Amenity, i: number) => (typeof a === "string" ? a : a.id ?? i);
  const featureLabel = (v?: number | null, s?: string, p?: string) => (v && v > 0 ? `${v} ${v === 1 ? s : p}` : "-");

  // Prepare features
  type Key = "bedrooms" | "bathrooms" | "rooms" | "area" | "coveredArea";
  const allFeatures: { key: Key; label: string; icon: React.ReactNode }[] = [
    {
      key: "bedrooms",
      label: featureLabel(property.bedrooms, "dormitorio", "dormitorios"),
      icon: <HotelIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />,
    },
    {
      key: "bathrooms",
      label: featureLabel(property.bathrooms, "baño", "baños"),
      icon: <BathtubIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />,
    },
    {
      key: "rooms",
      label: featureLabel(property.rooms, "ambiente", "ambientes"),
      icon: <DoorFrontIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />,
    },
    {
      key: "area",
      label: property.area ? `${property.area} m²` : "- m²",
      icon: <SquareFootIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />,
    },
    {
      key: "coveredArea",
      label: property.coveredArea ? `${property.coveredArea} m² cubiertos` : "- m² cubiertos",
      icon: <FoundationIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />,
    },
  ];

  const features = allFeatures.filter((f) => {
    if (comparisonItems.length <= 1) return true;
    const val = (property as any)[f.key] as number | null;
    const others = comparisonItems
      .filter((item) => item.id !== property.id)
      .some((item) => ((item as any)[f.key] as number) > 0);
    return (val && val > 0) || others;
  });

  // Prepare amenities
  const rawAmenities: Amenity[] = property.amenities ?? [];
  const amenities = rawAmenities.map(labelOfAmenity).filter(Boolean);

  // Address
  const address = formatPropertyAddress(property);

  return (
    <Stack spacing={2} sx={{ maxWidth: { xs: "100%", md: 600 }, mx: "auto", width: "100%" }}>
      {/* Title */}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {property.title}
      </Typography>

      {/* Location */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <LocationOnIcon fontSize="small" sx={{ opacity: 0.7, fontSize: 18 }} />
        <Typography variant="body2" color="text.secondary">
          {address || "Ubicación desconocida"}
        </Typography>
      </Box>

      {/* Price & Expenses */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 3, mb: 1, flexWrap: "wrap" }}>
        <Typography variant="h5" color="primary" fontWeight={700}>
          {property.showPrice && property.price > 0
            ? formatPrice(property.price, property.currency)
            : "Consultar precio"}
        </Typography>
        {property.showPrice && (
          <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
            {property.expenses && property.expenses > 0
              ? `Expensas: ${formatPrice(property.expenses, "ARS")}`
              : "Sin expensas"}
          </Typography>
        )}
      </Box>

      {/* Operation & Status Chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
        <Chip
          label={property.operation.toUpperCase()}
          size="small"
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: "#fff",
            fontSize: "0.75rem",
            pointerEvents: "none",
            cursor: "default",
            userSelect: "none",
          }}
          clickable={false}
          tabIndex={-1}
        />
        <Chip
          label={property.status}
          size="small"
          variant="outlined"
          sx={{ fontSize: "0.75rem", pointerEvents: "none", cursor: "default", userSelect: "none" }}
          clickable={false}
          tabIndex={-1}
        />
      </Box>

      {/* Two-column Features & Amenities */}
      {(features.length || amenities.length) && (
        <Box>
          <Divider />
          <Box
            sx={{
              mt: 2,
              display: "grid",
              // 2 columnas en todos los breakpoints (incluido xs)
              gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(2, minmax(0,1fr))" },
              columnGap: { xs: 2, sm: 3 },
              rowGap: 2,
              alignItems: "start",
            }}
          >
            {/* Especificaciones (izquierda) */}
            <Stack spacing={{ xs: 1.25, sm: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Especificaciones
              </Typography>
              {features.map((f, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 } }}>
                  {f.icon}
                  <Typography variant="body2">{f.label}</Typography>
                </Box>
              ))}
            </Stack>

            <Stack spacing={{ xs: 1, sm: 1.25 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Características
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {rawAmenities.map((am, i) => (
                  <Chip
                    key={keyOfAmenity(am, i)}
                    label={labelOfAmenity(am)}
                    size="small"
                    variant="outlined"
                    clickable={false}
                    tabIndex={-1}
                    sx={{ pointerEvents: "none", cursor: "default", userSelect: "none" }}
                  />
                ))}
              </Box>
            </Stack>
          </Box>
        </Box>
      )}
    </Stack>
  );
};

export default PropertyInfoCompare;
