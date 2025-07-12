import { useState, useMemo } from "react";
import { SearchParams } from "../types/searchParams";
import { Property } from "../types/property";
import { usePropertiesContext } from "../context/PropertiesContext";
import { getPropertiesByFilters } from "../services/property.service";

export function useSearchFilters(onSearch: (results: Property[]) => void) {
  const {
    buildSearchParams,
    operationsList,
    typesList,
    amenitiesList,
    neighborhoodsList,
    selected,
    setSelected,
  } = usePropertiesContext();

  // Defaults
  const [params, setParams] = useState({
    operation: "",
    type: "",
    rooms: 0,
    priceRange: [0, 1000000] as [number, number],
    areaRange: [0, 1000] as [number, number],
    coveredRange: [0, 1000] as [number, number],
    city: "",
    neighborhood: "",
    credit: false,
    financing: false,
  });

  // Ejecuta búsqueda
  const apply = async (override = params) => {
    const base: Partial<SearchParams> = {
      operation: override.operation || "",
      type: override.type || "",
      city: override.city || "",
      neighborhood: override.neighborhood || "",
      priceFrom: override.priceRange[0],
      priceTo: override.priceRange[1],
      areaFrom: override.areaRange[0],
      areaTo: override.areaRange[1],
      coveredAreaFrom: override.coveredRange[0],
      coveredAreaTo: override.coveredRange[1],
      credit:
        override.operation === "VENTA" && override.credit ? true : undefined,
      financing:
        override.operation === "VENTA" && override.financing ? true : undefined,
      rooms:
        override.rooms > 0 && override.rooms < 3 ? override.rooms : undefined,
    };
    // Manejo de rooms >=3
    if (override.rooms === 3) base.rooms = undefined;

    let results = await getPropertiesByFilters(
      buildSearchParams(base) as SearchParams
    );
    if (override.rooms === 3) {
      results = results.filter((r) => Number(r.rooms) >= 3);
    }
    onSearch(results);
  };

  // Toggle param único
  const toggleParam = <K extends keyof typeof params>(
    key: K,
    value: (typeof params)[K]
  ) => {
    const next = {
      ...params,
      [key]: params[key] === value ? (key === "rooms" ? 0 : "") : value,
    };
    setParams(next);
    apply(next);
  };

  // Agrega o quita un amenity y vuelve a aplicar
  const toggleAmenity = (amenityId: number) => {
    const amenities = selected.amenities.includes(amenityId)
      ? selected.amenities.filter((id) => id !== amenityId)
      : [...selected.amenities, amenityId];

    setSelected({ ...selected, amenities });
    apply(); // toma params actuales + selected actualizado al consultar buildSearchParams
  };

  // Reset general
  const reset = async () => {
    setParams({
      operation: "",
      type: "",
      rooms: 0,
      priceRange: [0, 1000000],
      areaRange: [0, 1000],
      coveredRange: [0, 1000],
      city: "",
      neighborhood: "",
      credit: false,
      financing: false,
    });
    setSelected({ owner: null, neighborhood: null, type: null, amenities: [] });
    await apply({
      operation: "",
      type: "",
      rooms: 0,
      priceRange: [0, 1000000],
      areaRange: [0, 1000],
      coveredRange: [0, 1000],
      city: "",
      neighborhood: "",
      credit: false,
      financing: false,
    });
  };

  // Chips activos
  const chips = useMemo(() => {
    const list: { label: string; onClear(): void }[] = [];
    if (params.operation)
      list.push({
        label: params.operation,
        onClear: () => toggleParam("operation", params.operation),
      });
    if (params.operation === "VENTA" && params.credit)
      list.push({
        label: "Apto Crédito",
        onClear: () => toggleParam("credit", params.credit),
      });
    if (params.operation === "VENTA" && params.financing)
      list.push({
        label: "Apto Financiamiento",
        onClear: () => toggleParam("financing", params.financing),
      });
    if (params.type)
      list.push({
        label: params.type,
        onClear: () => toggleParam("type", params.type),
      });
    if (params.rooms)
      list.push({
        label: params.rooms === 3 ? "3+" : `${params.rooms}`,
        onClear: () => toggleParam("rooms", params.rooms),
      });
    if (params.city)
      list.push({
        label: params.city,
        onClear: () => toggleParam("city", params.city),
      });
    if (params.neighborhood)
      list.push({
        label: params.neighborhood,
        onClear: () => toggleParam("neighborhood", params.neighborhood),
      });
    const [minP, maxP] = params.priceRange;
    if (minP > 0 || maxP < 1000000)
      list.push({ label: `Precio: ${minP}–${maxP}`, onClear: reset });
    const [minA, maxA] = params.areaRange;
    if (minA > 0 || maxA < 1000)
      list.push({ label: `Sup: ${minA}–${maxA}`, onClear: reset });
    const [minC, maxC] = params.coveredRange;
    if (minC > 0 || maxC < 1000)
      list.push({ label: `Cub: ${minC}–${maxC}`, onClear: reset });
    if (selected.amenities.length)
      list.push({
        label: `${selected.amenities.length} caracts`,
        onClear: () => {
          setSelected({ ...selected, amenities: [] });
          apply();
        },
      });
    return list;
  }, [params, selected]);

  return {
    params,
    setParams,
    operationsList,
    typesList,
    amenitiesList,
    neighborhoodsList,
    selected,
    toggleParam,
    toggleAmenity,
    reset,
    apply,
    chips,
  };
}
