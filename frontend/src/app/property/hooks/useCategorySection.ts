import { useEffect, useState, useMemo, useCallback } from "react";
import { usePropertiesContext, Category } from "../context/PropertiesContext";
import { getAllOwners, getOwnersByText } from "../services/owner.service";
import type { Owner } from "../types/owner";

export function useCategorySection(category: Category) {
  const {
    pickItem,
    data: rawData,
    loading,
    selected,
    toggleSelect,
  } = usePropertiesContext();

  const [owners, setOwners] = useState<Owner[]>([]);

  // 1) Sincronizar categoría y datos iniciales
  useEffect(() => {
    pickItem("category", category);
    if (category === "owner") {
      setOwners((rawData as Owner[]) || []);
    }
  }, [category, pickItem, rawData]);

  // 2a) Búsqueda por texto (devuelve Owner[])
  const searchOwnersText = useCallback(
    async (text: string) => {
      if (category !== "owner") return;
      const list = text ? await getOwnersByText(text) : await getAllOwners();
      setOwners(list as Owner[]);
    },
    [category]
  );

  // 2b) Recepción directa de resultados (para SearchBar.onSearch)
  const searchResults = useCallback(
    (items: Owner[]) => {
      if (category === "owner") setOwners(items);
    },
    [category]
  );

  // 3) Normalizar data para la tabla y asegurar nunca null
  const data = useMemo(() => {
    if (category === "owner") {
      return owners.map((o) => ({
        ...o,
        fullName: `${o.firstName} ${o.lastName}`.trim(),
      }));
    }
    return (rawData as any[]) || [];
  }, [category, owners, rawData]);

  // 4) Selección según categoría
  const isSelected = useCallback(
    (id: number) => {
      if (category === "amenity") return selected.amenities.includes(id);
      if (category === "owner") return selected.owner === id;
      if (category === "neighborhood") return selected.neighborhood === id;
      if (category === "type") return selected.type === id;
      return false;
    },
    [category, selected]
  );

  return {
    data,
    loading,
    toggleSelect,
    isSelected,
    searchOwnersText,
    searchResults,
  };
}
