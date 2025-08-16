import { useState, useEffect, useCallback } from "react";

import { usePropertiesContext } from "../context/PropertiesContext";
import type { Property } from "../types/property";
import { useApiErrors } from "../../shared/hooks/useErrors";

export const usePropertyPanel = () => {
  const { propertiesList, refreshProperties } = usePropertiesContext();
  const { handleError } = useApiErrors();

  // datos filtrados
  const [data, setData] = useState<Property[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  // selección de fila
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 1) carga inicial
  useEffect(() => {
    (async () => {
      setLocalLoading(true);
      try {
        await refreshProperties();
      } catch (e) {
        handleError(e);
      } finally {
        setLocalLoading(false);
      }
    })();
  }, [refreshProperties]);

  // 2) cuando cambian en el contexto
  useEffect(() => {
    setData(propertiesList ?? []);
    setLocalLoading(false);
  }, [propertiesList]);

  // 3) búsqueda (SearchBar.onSearch)
  const onSearch = useCallback((results: Property[]) => {
    setData(results);
  }, []);

  // 4) selección
  const toggleSelect = useCallback((id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const isSelected = useCallback((id: number) => selectedId === id, [selectedId]);

  return {
    data,
    loading: localLoading,
    onSearch,
    toggleSelect,
    isSelected,
  };
};
