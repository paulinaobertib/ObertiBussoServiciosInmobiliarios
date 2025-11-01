import { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useFavoritesContext } from "../../context/FavoritesContext";
import { getPropertyById } from "../../../property/services/property.service";
import type { Property } from "../../../property/types/property";
import { CatalogList } from "../../../property/components/catalog/CatalogList";
import { EmptyState } from "../../../shared/components/EmptyState";

export const FavoritesPanel = () => {
  const navigate = useNavigate();
  const { favorites, loading: favLoading } = useFavoritesContext();
  const [favoriteProps, setFavoriteProps] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (favorites.length === 0) {
      setFavoriteProps([]);
      setLoadingProps(false);
      return;
    }
    setLoadingProps(true);
    (async () => {
      const results = await Promise.all(
        favorites.map((f) =>
          getPropertyById(f.propertyId)
            .then((r) => (r as any).data ?? r)
            .catch(() => null)
        )
      );
      if (!mounted) return;
      setFavoriteProps(results.filter((p): p is Property => !!p && typeof p.id === "number"));
      setLoadingProps(false);
    })();
    return () => {
      mounted = false;
    };
  }, [favorites]);

  const loading = favLoading || loadingProps;

  const availableFavorites = favoriteProps.filter((p) => (p.status || "").trim().toLowerCase() === "disponible");

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (availableFavorites.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <EmptyState
          title={"No tienes favoritos disponibles"}
          description="Puedes agregar los tuyos desde el catalogo."
          minHeight={220}
        />
      </Box>
    );
  }

  return <CatalogList properties={availableFavorites} onCardClick={(prop) => navigate(`/properties/${prop.id}`)} />;
};
