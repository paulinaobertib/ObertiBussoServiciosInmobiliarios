// src/app/user/hooks/useFavorites.ts
import { useState, useEffect, useCallback } from "react";
import {
  getFavoritesByUser,
  createFavorite,
  deleteFavorite,
} from "../services/favorite.service";
import { useAuthContext } from "../context/AuthContext";
import { Favorite } from "../types/favorite";
import { useGlobalAlert } from "../../shared/context/AlertContext";

export function useFavorites() {
  const { info, isLogged } = useAuthContext();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useGlobalAlert();

  useEffect(() => {
    if (!isLogged) {
      setFavorites([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getFavoritesByUser(info!.id);
        if (!cancelled) setFavorites(res.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        showAlert("No se pudieron cargar los favoritos", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [info?.id, isLogged, showAlert]);

  const isFavorite = useCallback(
    (propertyId: number) =>
      favorites.some((f) => f.propertyId === propertyId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (propertyId: number) => {
      if (!isLogged) {
        showAlert(
          "Para guardar como favorita esta propiedad, iniciá sesión",
          "info"
        );
        return;
      }
      setLoading(true);
      try {
        if (isFavorite(propertyId)) {
          const fav = favorites.find((f) => f.propertyId === propertyId)!;
          await deleteFavorite(fav.id);
          setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
          showAlert("Propiedad eliminada de tus favoritos", "info");
        } else {
          const res = await createFavorite(info!.id, propertyId);
          setFavorites((prev) => [...prev, res.data]);
          showAlert("Propiedad agregada a tus favoritos", "info");
        }
      } catch (error: any) {
        const message = error.response?.data ?? "Error desconocido";
        showAlert(message, "error");
      } finally {
        setLoading(false);
      }
    },
    [favorites, info?.id, isLogged, isFavorite, showAlert]
  );

  return { favorites, loading, isFavorite, toggleFavorite };
}
