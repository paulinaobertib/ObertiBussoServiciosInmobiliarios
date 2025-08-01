import { useCallback, useEffect, useMemo, useState } from "react";
import { usePropertiesContext, Category } from "../context/PropertiesContext";

export const useCategorySection = (category: Category) => {
  const ctx = usePropertiesContext();
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [localLoading, setLocalLoading] = useState(true);

  // 1. Datos globales según categoría
  const data = useMemo(() => {
    switch (category) {
      case "owner":
        return ctx.ownersList;
      case "amenity":
        return ctx.amenitiesList;
      case "type":
        return ctx.typesList;
      case "neighborhood":
        return ctx.neighborhoodsList;
      default:
        return [];
    }
  }, [category, ctx]);

  // 2. Función refresh según categoría
  const refresh = useCallback(() => {
    switch (category) {
      case "owner":
        return ctx.refreshOwners();
      case "amenity":
        return ctx.refreshAmenities();
      case "type":
        return ctx.refreshTypes();
      case "neighborhood":
        return ctx.refreshNeighborhoods();
      default:
        return Promise.resolve();
    }
  }, [category, ctx]);

  // 3. Refrescar al montar o cambiar categoría
  useEffect(() => {
    setLocalLoading(true);
    refresh().finally(() => setLocalLoading(false));
  }, [category]);

  // 4. Limpiar búsqueda cuando cambian datos o categoría
  useEffect(() => {
    setSearchResults(null);
  }, [category, data]);

  // 5. Callback genérico para resultados de búsqueda
  const onSearch = useCallback((items: any[]) => {
    setSearchResults(items);
  }, []);

  // 6. Determinar selección
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

  // 7. Preparar datos para tabla (fullName para owners)
  const tableData = useMemo(() => {
    const list = searchResults ?? data;
    if (category === "owner") {
      return (list as any[]).map((o) => ({
        ...o,
        fullName: `${o.firstName} ${o.lastName}`.trim(),
      }));
    }
    return list;
  }, [category, data, searchResults]);

  return {
    data: tableData,
    loading: localLoading,
    refresh,
    onSearch,
    isSelected,
    toggleSelect: (id: number) => ctx.toggleSelect(category, id),
  };
};
