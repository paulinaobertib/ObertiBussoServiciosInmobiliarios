import React from "react";
import { Box } from "@mui/material";
import { PropertyCarousel } from "./PropertyCarousel";
import { Property } from "../../types/property";

interface Props {
  property: Property;
  InfoComponent: React.FC<{ property: Property }>;
  vertical?: boolean;
}

export const PropertyPanel = ({ property, InfoComponent, vertical = false }: Props) => {
  const main = typeof property.mainImage === "string" ? property.mainImage : (property.mainImage as any).url;
  const gallery = property.images.map((img) => (typeof img === "string" ? img : (img as any).url));
  const unique = Array.from(new Set([main, ...gallery]));
  const images = unique.map((url, i) => ({ id: i, url }));

  return (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "quaternary.main",
        borderRadius: 2,
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box
        sx={{
          display: vertical ? "block" : { xs: "block", md: "flex" },
          gap: vertical ? 0 : 3,
        }}
      >
        {/* Carrusel ocupa la mitad y estira */}
        <Box
          sx={{
            minWidth: 0,
            ...(vertical ? { flexShrink: 0, mb: 2 } : { flex: 1 }),
          }}
        >
          <PropertyCarousel images={images.slice(1)} mainImage={images[0].url} title={property.title} />
        </Box>

        {/* Panel de info */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            overflowY: "auto",
          }}
        >
          <InfoComponent property={property} />
        </Box>
      </Box>

      {/* {property.description && (
        <Box>
          <Divider />
          <Typography variant="subtitle1" fontWeight={700} sx={{ my: 1 }}>
            Descripción
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line", textAlign: "justify" }}>
            {property.description}
          </Typography>
        </Box>
      )} */}
    </Box>
  );
};
