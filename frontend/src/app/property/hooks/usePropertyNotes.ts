import { useState, useEffect, useCallback } from "react";
import { getPropertyById } from "../services/property.service";
import { getCommentsByPropertyId } from "../services/comment.service";
import { getMaintenancesByPropertyId } from "../services/maintenance.service";
import { useApiErrors } from "../../shared/hooks/useErrors";
import { getUserById } from "../../user/services/user.service";

export const usePropertyNotes = (propertyId: number) => {
  const { handleError } = useApiErrors();
  const [property, setProperty] = useState<any>();
  const [comments, setComments] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // Loading global para primer carga
  const [loading, setLoading] = useState(true);

  // Loading independientes por sección
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingMaintenances, setLoadingMaintenances] = useState(false);

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
  }, [propertyId]);

  // Prefetch author names when comments change
  useEffect(() => {
    const uniqueIds = Array.from(new Set((comments ?? []).map((c: any) => c.userId).filter(Boolean)));
    const missing = uniqueIds.filter((id) => !userNames[id]);
    if (!missing.length) return;
    (async () => {
      try {
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const resp = await getUserById(id);
              const user = (resp as any).data ?? resp;
              const name = user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.userName || id;
              return { id, name } as const;
            } catch {
              return { id, name: id } as const;
            }
          })
        );
        setUserNames((prev) => {
          const next = { ...prev } as Record<string, string>;
          for (const { id, name } of results) next[id] = name;
          return next;
        });
      } catch {
        // ignore; names will fallback to id
      }
    })();
  }, [comments, userNames]);

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
  }, [propertyId]);

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
  }, [propertyId]);

  return {
    property,
    comments,
    maintenances,
    loading,
    loadingComments,
    loadingMaintenances,
    refreshComments,
    refreshMaintenances,
    getUserName: (id: string) => userNames[id] || id,
  };
};