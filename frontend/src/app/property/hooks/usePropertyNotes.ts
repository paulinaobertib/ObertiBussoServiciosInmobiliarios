import { useState, useEffect, useCallback } from "react";
import { getPropertyById } from "../services/property.service";
import { getCommentsByPropertyId } from "../services/comment.service";
import { getMaintenancesByPropertyId } from "../services/maintenance.service";
import { useApiErrors } from "../../shared/hooks/useErrors";

export const usePropertyNotes = (propertyId: number) => {
  const { handleError } = useApiErrors();
  const [property, setProperty] = useState<any>();
  const [comments, setComments] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);

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
  };
};
