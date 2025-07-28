// src/app/property/hooks/useCategorySection.ts
import { useEffect, useState, useCallback, useMemo } from "react";
import { usePropertiesContext, Category } from "../context/PropertiesContext";

import { getAllAmenities } from "../services/amenity.service";
import { getAllOwners, getOwnersByText } from "../services/owner.service";
import { getAllTypes } from "../services/type.service";
import { getAllNeighborhoods } from "../services/neighborhood.service";

import type { Owner } from "../types/owner";

export function useCategorySection(category: Category) {
  const { pickItem, selected, toggleSelect } = usePropertiesContext();

  // Un solo estado para la lista
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Función que carga la lista según categoría
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      let list: any[];
      switch (category) {
        case "amenity":
          list = await getAllAmenities();
          break;
        case "owner":
          list = await getAllOwners();
          break;
        case "type":
          list = await getAllTypes();
          break;
        case "neighborhood":
          list = await getAllNeighborhoods();
          break;
      }
      setData(list); // aquí actualizamos data directamente
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Al cambiar de pestaña, vaciamos y recargamos
  useEffect(() => {
    pickItem("category", category);
    setData([]); // opcional: limpia viejo contenido
    fetchList();
  }, [category, fetchList]);

  // Búsqueda sólo para owners
  const searchOwnersText = useCallback(
    async (txt: string) => {
      if (category !== "owner") return;
      setLoading(true);
      try {
        const list = txt ? await getOwnersByText(txt) : await getAllOwners();
        setData(list); // reutilizamos el mismo estado
      } finally {
        setLoading(false);
      }
    },
    [category]
  );

  // Opción de pasar resultados directamente
  const searchResults = useCallback(
    (items: Owner[]) => {
      if (category === "owner") {
        setData(items);
      }
    },
    [category]
  );

  // Selección (igual que antes)
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

  // Preparamos los datos finales: si es owner, añadimos fullName
  const tableData = useMemo(() => {
    if (category === "owner") {
      return (data as Owner[]).map((o) => ({
        ...o,
        fullName: `${o.firstName} ${o.lastName}`.trim(),
      }));
    }
    return data;
  }, [category, data]);

  return {
    data: tableData,
    loading,
    refresh: fetchList,
    searchOwnersText,
    searchResults,
    isSelected,
    toggleSelect: (id: number) => toggleSelect(id),
  };
}
