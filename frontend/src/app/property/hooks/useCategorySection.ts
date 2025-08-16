import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { usePropertiesContext, Category } from "../context/PropertiesContext";
import { useApiErrors } from "../../shared/hooks/useErrors";

export const useCategorySection = (category: Category) => {
  const ctx = usePropertiesContext();
  const { handleError } = useApiErrors();

  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const mountedRef = useRef(true);

  // 1) Datos globales según categoría (desestructuro para deps más estables)
  const {
    ownersList,
    amenitiesList,
    typesList,
    neighborhoodsList,
    selected,
    toggleSelect: toggleSelectCtx,
    refreshOwners,
    refreshAmenities,
    refreshTypes,
    refreshNeighborhoods,
  } = ctx;

  const data = useMemo(() => {
    switch (category) {
      case "owner":
        return ownersList;
      case "amenity":
        return amenitiesList;
      case "type":
        return typesList;
      case "neighborhood":
        return neighborhoodsList;
      default:
        return [];
    }
  }, [category, ownersList, amenitiesList, typesList, neighborhoodsList]);

  // 2) Función refresh según categoría
  const refresh = useCallback(() => {
    switch (category) {
      case "owner":
        return refreshOwners();
      case "amenity":
        return refreshAmenities();
      case "type":
        return refreshTypes();
      case "neighborhood":
        return refreshNeighborhoods();
      default:
        return Promise.resolve();
    }
  }, [category, refreshOwners, refreshAmenities, refreshTypes, refreshNeighborhoods]);

  // 3) Refrescar al montar o cambiar categoría, con manejo de error
  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      setLocalLoading(true);
      try {
        await refresh();
      } catch (e) {
        if (mountedRef.current) handleError(e);
      } finally {
        if (mountedRef.current) setLocalLoading(false);
      }
    })();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh, handleError]);

  // 4) Limpiar búsqueda cuando cambian datos o categoría
  useEffect(() => {
    setSearchResults(null);
  }, [category, data]);

  // 5) Callback genérico para resultados de búsqueda
  const onSearch = useCallback((items: any[]) => {
    setSearchResults(items);
  }, []);

  // 6) Determinar selección
  const isSelected = useCallback(
    (id: number) => {
      switch (category) {
        case "amenity":
          return selected.amenities.includes(id);
        case "owner":
          return selected.owner === id;
        case "neighborhood":
          return selected.neighborhood === id;
        case "type":
          return selected.type === id;
        default:
          return false;
      }
    },
    [category, selected]
  );

  // 7) Preparar datos para tabla (fullName para owners)
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
    toggleSelect: (id: number) => toggleSelectCtx(category, id),
  };
};
