import { useState, useEffect, useCallback } from "react";
import { getPropertyById } from "../services/property.service";
import { getCommentsByPropertyId } from "../services/comment.service";
import { getMaintenancesByPropertyId } from "../services/maintenance.service";

export const usePropertyNotes = (propertyId: number) => {
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
    Promise.all([
      getPropertyById(propertyId),
      getCommentsByPropertyId(propertyId),
      getMaintenancesByPropertyId(propertyId),
    ])
      .then(([prop, coms, mains]) => {
        if (!mounted) return;
        setProperty(prop);
        setComments(coms ?? []);
        setMaintenances(mains ?? []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [propertyId]);

  const refreshComments = useCallback(async () => {
    setLoadingComments(true);
    const coms = await getCommentsByPropertyId(propertyId);
    setComments(coms ?? []);
    setLoadingComments(false);
  }, [propertyId]);

  const refreshMaintenances = useCallback(async () => {
    setLoadingMaintenances(true);
    const mains = await getMaintenancesByPropertyId(propertyId);
    setMaintenances(mains ?? []);
    setLoadingMaintenances(false);
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
