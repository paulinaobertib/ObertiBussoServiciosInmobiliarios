import { useEffect, useState, useMemo, useCallback } from "react";
import { usePropertiesContext, Category } from "../context/PropertiesContext";
import { getAllOwners, getOwnersByText } from "../services/owner.service";
import type { Owner } from "../types/owner";

export function useCategorySection(category: Category) {
  const {
    /* datos y acciones globales */
    pickItem,
    data: rawData,
    loading,
    selected,
    toggleSelect,

    /* métodos de refresco exportados por el contexto */
    refreshAmenities,
    refreshOwners,
    refreshTypes,
    refreshNeighborhoods,
  } = usePropertiesContext();

  /* -------- refresco específico según categoría -------- */
  const refresh = useCallback(() => {
    switch (category) {
      case "amenity":
        refreshAmenities();
        break;
      case "owner":
        refreshOwners();
        break;
      case "type":
        refreshTypes();
        break;
      case "neighborhood":
        refreshNeighborhoods();
        break;
      default:
        break;
    }
  }, [
    category,
    refreshAmenities,
    refreshOwners,
    refreshTypes,
    refreshNeighborhoods,
  ]);

  /* -------- disparar refresh al abrir/cambiar sección -------- */
  useEffect(() => {
    pickItem("category", category); // avisa al contexto cuál está activa
    refresh(); // trae la data de esa categoría
  }, [category, pickItem, refresh]);

  /* -------- caso especial: Owners con buscador -------- */
  const [owners, setOwners] = useState<Owner[]>([]);

  useEffect(() => {
    if (category === "owner") setOwners((rawData as Owner[]) || []);
  }, [category, rawData]);

  const searchOwnersText = useCallback(
    async (text: string) => {
      if (category !== "owner") return;
      const list = text ? await getOwnersByText(text) : await getAllOwners();
      setOwners(list as Owner[]);
    },
    [category]
  );

  const searchResults = useCallback(
    (items: Owner[]) => {
      if (category === "owner") setOwners(items);
    },
    [category]
  );

  /* -------- normalizar data para la tabla -------- */
  const data = useMemo(() => {
    if (category === "owner") {
      return owners.map((o) => ({
        ...o,
        fullName: `${o.firstName} ${o.lastName}`.trim(),
      }));
    }
    return (rawData as any[]) || [];
  }, [category, owners, rawData]);

  /* -------- helper de selección -------- */
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

  return {
    /* datos para la tabla */
    data,
    loading,

    /* selección (se persiste en el contexto) */
    isSelected,
    toggleSelect: (id: number) => toggleSelect(id),

    /* buscador de owners */
    searchOwnersText,
    searchResults,

    /* botón “Actualizar” si lo necesitas */
    refresh,
  };
}
