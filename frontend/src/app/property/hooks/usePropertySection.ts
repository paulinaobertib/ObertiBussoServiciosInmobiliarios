import { useState, useEffect, useCallback } from "react";
import { usePropertiesContext } from "../context/PropertiesContext";
import type { Property } from "../types/property";

export const usePropertyPanel = () => {
  const { propertiesList, refreshProperties } = usePropertiesContext();
  // datos filtrados
  const [data, setData] = useState<Property[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  // selección de fila
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 1) carga inicial
  useEffect(() => {
    refreshProperties();
  }, [refreshProperties]);

  // 2) cuando cambian en el contexto
  useEffect(() => {
    setData(propertiesList ?? []); // <-- Corrige el warning
    setLocalLoading(false);
  }, [propertiesList]);

  // 3) búsqueda (SearchBar.onSearch)
  const onSearch = useCallback((results: Property[]) => {
    setData(results);
  }, []);

  // 4) selección
  const toggleSelect = useCallback((id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
    // console.log("toggleSelect:", id);
  }, []);

  const isSelected = useCallback(
    (id: number) => selectedId === id,
    [selectedId]
  );

  return {
    data,
    loading: localLoading,
    onSearch,
    toggleSelect,
    isSelected,
  };
};
