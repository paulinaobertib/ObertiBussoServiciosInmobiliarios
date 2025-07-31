import { useCallback, useEffect, useMemo, useState } from "react";
import { usePropertiesContext, Category } from "../context/PropertiesContext";
import { getOwnersByText } from "../services/owner.service";
import type { Owner } from "../types/owner";

export const useCategorySection = (category: Category) => {
  const ctx = usePropertiesContext();
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [localLoading, setLocalLoading] = useState(true);

  /* 1. Array global según categoría */
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

  /* 2. Función refresh según categoría */
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

  /* 3. Refrescar al montar/cambiar categoría */
  useEffect(() => {
    setLocalLoading(true);
    refresh().finally(() => setLocalLoading(false));
  }, [category, refresh]);

  /* 4. Limpiar búsqueda cuando los datos globales cambian */
  useEffect(() => {
    if (category === "owner") {
      setSearchResults(null);
    }
  }, [category, data]);

  /* 5. Búsqueda textual solo para owners */
  const searchOwnersText = useCallback(
    async (txt: string) => {
      if (category !== "owner") return;
      if (txt) {
        setSearchResults(await getOwnersByText(txt));
      } else {
        setLocalLoading(true);
        await refresh();
        setSearchResults(null);
        setLocalLoading(false);
      }
    },
    [category, refresh]
  );

  /* 6. Callback directo desde <SearchBar/> */
  const searchResultsCb = useCallback(
    (items: Owner[]) => {
      if (category === "owner") setSearchResults(items);
    },
    [category]
  );

  /* 7. Selección */
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

  /* 8. Data de la tabla (fullName en owners) */
  const tableData = useMemo(() => {
    const arr = searchResults ?? data; // prioridad a resultados de búsqueda
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
    loading: localLoading,
    refresh,
    searchOwnersText,
    searchResults: searchResultsCb,
    isSelected,
    toggleSelect: (id: number) => ctx.toggleSelect(category, id),
  };
};
