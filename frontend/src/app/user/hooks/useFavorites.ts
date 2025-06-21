import { useState, useEffect, useCallback } from "react";
import {
  getFavoritesByUser,
  createFavorite,
  deleteFavorite,
} from "../services/favorite.service";
import { useAuthContext } from "../context/AuthContext";
import { Favorite } from "../types/favorite";
import { useGlobalAlert } from "../../property/context/AlertContext";

/**
 * Hook para gestionar favoritos de propiedades para el usuario logueado.
 */
export function useFavorites() {
  const { info, isLogged } = useAuthContext();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useGlobalAlert();

  // Carga inicial de favoritos al autenticar
  useEffect(() => {
    if (!isLogged) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await getFavoritesByUser(info!.id);
        setFavorites(res.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        showAlert("No se pudieron cargar los favoritos", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [info, isLogged, showAlert]);

  /**
   * Comprueba si una propiedad está marcada como favorita.
   */
  const isFavorite = useCallback(
    (propertyId: number) => favorites.some((f) => f.propertyId === propertyId),
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
    [favorites, info, isFavorite, isLogged, showAlert]
  );

  return { favorites, loading, isFavorite, toggleFavorite };
}
