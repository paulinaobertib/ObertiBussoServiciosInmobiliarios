// src/app/property/hooks/useCategorySection.ts
import { useEffect, useState, useCallback, useMemo } from "react";
import { usePropertiesContext, Category } from "../context/PropertiesContext";

/* ——— SERVICIOS REST (ajusta las rutas) ——— */
import { getAllAmenities } from "../services/amenity.service";
import { getAllOwners, getOwnersByText } from "../services/owner.service";
import { getAllTypes } from "../services/type.service";
import { getAllNeighborhoods } from "../services/neighborhood.service";

import type { Owner } from "../types/owner";

export function useCategorySection(category: Category) {
  const { pickItem, selected, toggleSelect } = usePropertiesContext();

  /* ----- estado local ----- */
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoad] = useState(false);

  /* ----- trae la lista que corresponde a la pestaña actual ----- */
  const fetchList = useCallback(async () => {
    setLoad(true);
    try {
      let list: any[] = [];
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
      setData(list);
    } finally {
      setLoad(false);
    }
  }, [category]);

  /* ----- en cuanto cambia la pestaña, carga su lista ----- */
  useEffect(() => {
    pickItem("category", category); // sincroniza contexto
    fetchList();
  }, [category, fetchList]);

  /* ----- buscador (sólo owners) ----- */
  const [ownersUI, setOwnersUI] = useState<Owner[]>([]);
  useEffect(() => {
    if (category === "owner") setOwnersUI(data as Owner[]);
  }, [category, data]);

  const searchOwnersText = useCallback(
    async (txt: string) => {
      if (category !== "owner") return;
      const list = txt ? await getOwnersByText(txt) : await getAllOwners();
      setOwnersUI(list);
    },
    [category]
  );

  const searchResults = useCallback(
    (items: Owner[]) => {
      if (category === "owner") setOwnersUI(items);
    },
    [category]
  );

  /* ----- helper de selección ----- */
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

  /* ----- datos finales para la tabla ----- */
  const tableData = useMemo(
    () =>
      category === "owner"
        ? ownersUI.map((o) => ({
            ...o,
            fullName: `${o.firstName} ${o.lastName}`.trim(),
          }))
        : data,
    [category, ownersUI, data]
  );

  return {
    data: tableData,
    loading,
    /* botón “Actualizar” */
    refresh: fetchList,
    /* buscador owners */
    searchOwnersText,
    searchResults,
    /* selección */
    isSelected,
    toggleSelect: (id: number) => toggleSelect(id),
  };
}
