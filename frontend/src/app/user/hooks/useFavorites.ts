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

  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  /* ------------ helpers (alertas unificadas) ------------ */
  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Ok" });
      } else if (typeof alertApi?.showAlert === "function") {
        alertApi.showAlert(description ?? title, "success");
      }
    },
    [alertApi]
  );

  const notifyInfo = useCallback(
    async (title: string, description?: string) => {
      // si tu AlertContext tiene .info, usalo; si no, fallback a showAlert
      if (typeof alertApi?.info === "function") {
        await alertApi.info({ title, description, primaryLabel: "Entendido" });
      } else if (typeof alertApi?.showAlert === "function") {
        alertApi.showAlert(description ?? title, "info");
      }
    },
    [alertApi]
  );

  const confirmDanger = useCallback(async () => {
    if (typeof alertApi?.confirm === "function") {
      return await alertApi.confirm({
        description: "¿Confirmar eliminación?",
      });
    }
  }, [alertApi]);

  /* ------------------- carga inicial ------------------- */
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

  /* ------------------- toggle favorito ------------------- */
  const toggleFavorite = useCallback(
    async (propertyId: number) => {
      if (!isLogged) {
        await notifyInfo("Iniciá sesión", "Para guardar como favorita esta propiedad, iniciá sesión.");
        return;
      }
      if (!info?.id) {
        handleError(new Error("No se encontró el usuario autenticado."));
        return;
      }

      setLoading(true);
      try {
        if (isFavorite(propertyId)) {
          // doble confirmación antes de eliminar
          const ok = await confirmDanger();
          if (!ok) return;

          const fav = favorites.find((f) => f.propertyId === propertyId);
          if (!fav) throw new Error("No se encontró el favorito a eliminar.");

          await deleteFavorite(fav.id);
          setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
          await notifySuccess("Eliminado de favoritos");
        } else {
          const res = await createFavorite(info.id, propertyId);
          setFavorites((prev) => [...prev, res.data]);
          await notifySuccess("Agregado a favoritos");
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
    [favorites, info?.id, isLogged, isFavorite, notifyInfo, notifySuccess, confirmDanger, handleError]
  );

  return { favorites, loading, isFavorite, toggleFavorite };
}
