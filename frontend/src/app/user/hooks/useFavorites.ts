import { useState, useEffect, useCallback } from "react";
import { getFavoritesByUser, createFavorite, deleteFavorite } from "../services/favorite.service";
import { useAuthContext } from "../context/AuthContext";
import { Favorite } from "../types/favorite";
import { useGlobalAlert } from "../../shared/context/AlertContext";
import { useApiErrors } from "../../shared/hooks/useErrors";

export function useFavorites() {
  const { info, isLogged } = useAuthContext();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useGlobalAlert();
  const { handleError } = useApiErrors();

  useEffect(() => {
    if (!isLogged || !info?.id) {
      setFavorites([]);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await getFavoritesByUser(info.id);
        if (!cancelled) setFavorites(res.data);
      } catch (error) {
        if (!cancelled) handleError(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [info?.id, isLogged, handleError]);

  const isFavorite = useCallback(
    (propertyId: number) => favorites.some((f) => f.propertyId === propertyId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (propertyId: number) => {
      if (!isLogged) {
        showAlert("Para guardar como favorita esta propiedad, iniciá sesión", "info");
        return;
      }
      if (!info?.id) {
        handleError(new Error("No se encontró el usuario autenticado."));
        return;
      }

      setLoading(true);
      try {
        if (isFavorite(propertyId)) {
          const fav = favorites.find((f) => f.propertyId === propertyId);
          if (!fav) {
            throw new Error("No se encontró el favorito a eliminar.");
          }
          await deleteFavorite(fav.id);
          setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
          showAlert("Propiedad eliminada de tus favoritos", "info");
        } else {
          const res = await createFavorite(info.id, propertyId);
          setFavorites((prev) => [...prev, res.data]);
          showAlert("Propiedad agregada a tus favoritos", "info");
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
    [favorites, info?.id, isLogged, isFavorite, showAlert, handleError]
  );

  return { favorites, loading, isFavorite, toggleFavorite };
}
