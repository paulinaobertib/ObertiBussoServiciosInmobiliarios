import { useState, useEffect, useCallback } from "react";
import { getPropertyById } from "../services/property.service";
import { getCommentsByPropertyId, deleteComment } from "../services/comment.service";
import { getMaintenancesByPropertyId, deleteMaintenance } from "../services/maintenance.service";
import { useApiErrors } from "../../shared/hooks/useErrors";
import { getUserById } from "../../user/services/user.service";
import { useGlobalAlert } from "../../shared/context/AlertContext";
import type { Comment } from "../types/comment";
import type { Maintenance } from "../types/maintenance";

export const usePropertyNotes = (propertyId: number) => {
  const { handleError } = useApiErrors();
  const alertApi: any = useGlobalAlert();

  const [property, setProperty] = useState<any>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // Loading global para primer carga
  const [loading, setLoading] = useState(true);

  // Loading independientes por sección
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingMaintenances, setLoadingMaintenances] = useState(false);

  /* -------------------- helpers de UI (confirm / éxito) -------------------- */
  const confirmDanger = useCallback(async () => {
    // 1) doble confirmación (si existe en tu AlertContext)
    if (typeof alertApi?.doubleConfirm === "function") {
      return await alertApi.doubleConfirm({
        kind: "error",
        description: "¿Eliminar definitivamente esta nota?",
      });
    }
  }, [alertApi]);

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

  /* --------------------------- carga inicial --------------------------- */
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const [prop, coms, mains] = await Promise.all([
          getPropertyById(propertyId),
          getCommentsByPropertyId(propertyId),
          getMaintenancesByPropertyId(propertyId),
        ]);
        if (!mounted) return;
        setProperty(prop);
        setComments(coms ?? []);
        setMaintenances(mains ?? []);
      } catch (e) {
        if (mounted) handleError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [propertyId, handleError]);

  // Prefetch de nombres de autores cuando cambian los comentarios
  useEffect(() => {
    const uniqueIds = Array.from(new Set((comments ?? []).map((c: any) => c.userId).filter(Boolean)));
    const missing = uniqueIds.filter((id) => !userNames[String(id)]);
    if (!missing.length) return;

    (async () => {
      try {
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const resp = await getUserById(id);
              const user = (resp as any).data ?? resp;
              const name =
                user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.userName || String(id);
              return { id: String(id), name } as const;
            } catch {
              return { id: String(id), name: String(id) } as const;
            }
          })
        );
        setUserNames((prev) => {
          const next = { ...prev };
          for (const { id, name } of results) next[id] = name;
          return next;
        });
      } catch {
        // ignore; fallback al id
      }
    })();
  }, [comments, userNames]);

  /* --------------------------- refrescos parciales -------------------------- */
  const refreshComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const coms = await getCommentsByPropertyId(propertyId);
      setComments(coms ?? []);
    } catch (e) {
      handleError(e);
    } finally {
      setLoadingComments(false);
    }
  }, [propertyId, handleError]);

  const refreshMaintenances = useCallback(async () => {
    setLoadingMaintenances(true);
    try {
      const mains = await getMaintenancesByPropertyId(propertyId);
      setMaintenances(mains ?? []);
    } catch (e) {
      handleError(e);
    } finally {
      setLoadingMaintenances(false);
    }
  }, [propertyId, handleError]);

  /* ----------------------- acciones con confirmación ----------------------- */
  const removeComment = useCallback(
    async (comment: Comment) => {
      const ok = await confirmDanger();
      if (!ok) return false;
      try {
        await deleteComment(comment);
        await notifySuccess("Comentario eliminado");
        await refreshComments();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [confirmDanger, notifySuccess, refreshComments, handleError]
  );

  const removeMaintenance = useCallback(
    async (maintenance: Maintenance) => {
      const ok = await confirmDanger();
      if (!ok) return false;
      try {
        await deleteMaintenance(maintenance);
        await notifySuccess("Mantenimiento eliminado");
        await refreshMaintenances();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [confirmDanger, notifySuccess, refreshMaintenances, handleError]
  );

  return {
    property,
    comments,
    maintenances,
    loading,
    loadingComments,
    loadingMaintenances,
    refreshComments,
    refreshMaintenances,
    removeComment, // usar en CommentItem / CommentSection
    removeMaintenance, // usar en MaintenanceItem / MaintenanceSection
    getUserName: (id: string | number) => userNames[String(id)] || String(id),
  };
};
