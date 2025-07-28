// src/app/property/hooks/usePropertyNotes.ts
import { useState, useEffect, useCallback } from 'react';
import { getPropertyById } from '../services/property.service';
import { getCommentsByPropertyId } from '../services/comment.service';
import { getMaintenancesByPropertyId } from '../services/maintenance.service';
import type { Property } from '../types/property';
import type { Comment } from '../types/comment';
import type { Maintenance } from '../types/maintenance';

export function usePropertyNotes(propertyId?: number) {
  const [property, setProperty] = useState<Property | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [maint, setMaint] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      setLoading(true);
      try {
        const [p, c, m] = await Promise.all([
          getPropertyById(propertyId),
          getCommentsByPropertyId(propertyId),
          getMaintenancesByPropertyId(propertyId),
        ]);
        setProperty(p);
        setComments(c);
        setMaint(m);
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const refreshComments = useCallback(async () => {
    if (!propertyId) return;
    setComments(await getCommentsByPropertyId(propertyId));
  }, [propertyId]);

  const refreshMaintenances = useCallback(async () => {
    if (!propertyId) return;
    setMaint(await getMaintenancesByPropertyId(propertyId));
  }, [propertyId]);

  return {
    property,
    comments,
    maintenances: maint,
    loading,
    refreshComments,
    refreshMaintenances,
  };
}
