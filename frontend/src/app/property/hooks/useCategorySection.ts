import { useCallback, useMemo, useState } from "react";
import { usePropertiesContext, Category } from "../context/PropertiesContext";
import { getOwnersByText } from "../services/owner.service";
import type { Owner } from "../types/owner";

export const useCategorySection = (category: Category) => {
  const ctx = usePropertiesContext();
  const [searchResults, setSearchResults] = useState<any[] | null>(null);

  // El array principal global
  const data =
    category === "owner"
      ? ctx.ownersList
      : category === "amenity"
      ? ctx.amenitiesList
      : category === "type"
      ? ctx.typesList
      : category === "neighborhood"
      ? ctx.neighborhoodsList
      : [];

  // Elegir loading correcto (puede ser uno global o individual por categoría si tenés)
  const loading = ctx.loading; // O uno específico por categoría

  // Refresh correcto según categoría
  const refresh =
    category === "owner"
      ? ctx.refreshOwners
      : category === "amenity"
      ? ctx.refreshAmenities
      : category === "type"
      ? ctx.refreshTypes
      : category === "neighborhood"
      ? ctx.refreshNeighborhoods
      : () => Promise.resolve();

  // Búsqueda por texto (solo owners, resultado es local a este hook)
  const searchOwnersText = useCallback(
    async (txt: string) => {
      if (category !== "owner") return;
      if (txt) {
        setSearchResults(await getOwnersByText(txt));
      } else {
        await refresh();
        setSearchResults(null);
      }
    },
    [category, refresh]
  );

  // Pasar resultados de búsqueda directo
  const searchResultsCb = useCallback(
    (items: Owner[]) => {
      if (category === "owner") setSearchResults(items);
    },
    [category]
  );

  // Selección
  const isSelected = useCallback(
    (id: number) => {
      switch (category) {
        case "amenity":
          return ctx.selected.amenities.includes(id);
        case "owner":
          return ctx.selected.owner === id;
        case "neighborhood":
          return ctx.selected.neighborhood === id;
        case "type":
          return ctx.selected.type === id;
        default:
          return false;
      }
    },
    [category, ctx.selected]
  );

  // Data owners: fullName
  const tableData = useMemo(() => {
    const arr = searchResults ?? data;
    if (category === "owner") {
      return (arr as Owner[]).map((o) => ({
        ...o,
        fullName: `${o.firstName} ${o.lastName}`.trim(),
      }));
    }
    return arr;
  }, [category, data, searchResults]);

  return {
    data: tableData,
    loading,
    refresh,
    searchOwnersText,
    searchResults: searchResultsCb,
    isSelected,
    toggleSelect: ctx.toggleSelect,
  };
};
