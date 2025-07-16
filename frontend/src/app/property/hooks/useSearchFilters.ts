import { useState, useMemo } from "react";
import { SearchParams } from "../types/searchParams";
import { Property } from "../types/property";
import { usePropertiesContext } from "../context/PropertiesContext";
import { getPropertiesByFilters } from "../services/property.service";
import { LIMITS } from "../utils/filterLimits";
/**
 * Hook que administra todos los filtros de búsqueda.
 */
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

  /* ───────── estado principal ───────── */
  const [params, setParams] = useState({
    rooms: [] as number[],
    types: [] as string[],
    cities: [] as string[],
    neighborhoods: [] as string[],
    neighborhoodTypes: [] as string[],
    operation: "",
    currency: "",
    credit: false,
    financing: false,
    priceRange: [LIMITS.price.ARS.min, LIMITS.price.ARS.max] as [
      number,
      number
    ],
    areaRange: [LIMITS.surface.min, LIMITS.surface.max] as [number, number],
    coveredRange: [LIMITS.surface.min, LIMITS.surface.max] as [number, number],
  });

  /* ───────── util genérico para togglear ───────── */
  function toggleParam<
    K extends keyof typeof params,
    V extends (typeof params)[K] extends Array<infer U> ? U : (typeof params)[K]
  >(key: K, value: V) {
    setParams((prev) => {
      const current = prev[key] as any;
      if (Array.isArray(current)) {
        const arr = current as unknown[];
        const exists = arr.includes(value);
        return {
          ...prev,
          [key]: exists ? arr.filter((v) => v !== value) : [...arr, value],
        };
      }
      const cleared = current === value ? "" : value;
      return { ...prev, [key]: cleared };
    });
  }

  /* ───────── amenities siguen en `selected` ───────── */
  function toggleAmenity(amenityId: number) {
    const amenities = selected.amenities.includes(amenityId)
      ? selected.amenities.filter((id) => id !== amenityId)
      : [...selected.amenities, amenityId];

    setSelected({ ...selected, amenities });
    apply(); // aplica búsqueda con el nuevo estado
  }

  /* ───────── construir payload y llamar al backend ───────── */
  async function apply(local = params) {
    const base: Partial<SearchParams> = {
      operation: local.operation,
      currency: local.currency,
      priceFrom: local.priceRange[0],
      priceTo: local.priceRange[1],
      areaFrom: local.areaRange[0],
      areaTo: local.areaRange[1],
      coveredAreaFrom: local.coveredRange[0],
      coveredAreaTo: local.coveredRange[1],
      rooms: local.rooms,
      types: local.types,
      cities: local.cities,
      neighborhoods: local.neighborhoods,
      neighborhoodTypes: local.neighborhoodTypes,
      amenities: selected.amenities.map(String),
      credit:
        local.operation === "VENTA" ? local.credit || undefined : undefined,
      financing:
        local.operation === "VENTA" ? local.financing || undefined : undefined,
    };

    const result = await getPropertiesByFilters(
      buildSearchParams(base) as SearchParams
    );
    onSearch(result);
  }

  /* ───────── reset ───────── */
  async function reset() {
    setParams({
      rooms: [],
      types: [],
      cities: [],
      neighborhoods: [],
      neighborhoodTypes: [],
      operation: "",
      currency: "",
      credit: false,
      financing: false,
      priceRange: [LIMITS.price.ARS.min, LIMITS.price.ARS.max],
      areaRange: [LIMITS.surface.min, LIMITS.surface.max],
      coveredRange: [LIMITS.surface.min, LIMITS.surface.max],
    });
    setSelected({ owner: null, neighborhood: null, type: null, amenities: [] });
    await apply({
      rooms: [],
      types: [],
      cities: [],
      neighborhoods: [],
      neighborhoodTypes: [],
      operation: "",
      currency: "",
      credit: false,
      financing: false,
      priceRange: [LIMITS.price.ARS.min, LIMITS.price.ARS.max],
      areaRange: [LIMITS.surface.min, LIMITS.surface.max],
      coveredRange: [LIMITS.surface.min, LIMITS.surface.max],
    });
  }

  /* ───────── chips visibles ───────── */
  const chips = useMemo(() => {
    const list: { label: string; onClear(): void }[] = [];
    const push = (lbl: string, key: keyof typeof params, val?: any) =>
      list.push({
        label: lbl,
        onClear: () => toggleParam(key as any, val ?? lbl),
      });

    if (params.operation) push(params.operation, "operation");
    if (params.currency) push(params.currency, "currency");
    if (params.credit) push("Apto Crédito", "credit", true);
    if (params.financing) push("Financiamiento", "financing", true);
    params.types.forEach((t) => push(t, "types", t));
    params.cities.forEach((c) => push(c, "cities", c));
    params.neighborhoods.forEach((n) => push(n, "neighborhoods", n));
    params.neighborhoodTypes.forEach((t) => push(t, "neighborhoodTypes", t));
    params.rooms.forEach((r) => push(r === 3 ? "3+" : `${r}`, "rooms", r));
    /* rangos */
    const [minP, maxP] = params.priceRange;
    const maxAllowed =
      params.currency === "USD" ? LIMITS.price.USD.max : LIMITS.price.ARS.max;
    if (minP > LIMITS.price.USD.min || maxP < maxAllowed)
      list.push({ label: `Precio ${minP}-${maxP}`, onClear: reset });
    const [minA, maxA] = params.areaRange;
    if (minA > LIMITS.surface.min || maxA < LIMITS.surface.max)
      list.push({ label: `Sup ${minA}-${maxA}`, onClear: reset });
    const [minC, maxC] = params.coveredRange;
    if (minC > LIMITS.surface.min || maxC < LIMITS.surface.max)
      list.push({ label: `Cub ${minC}-${maxC}`, onClear: reset });
    /* amenities */
    if (selected.amenities.length)
      list.push({
        label: `${selected.amenities.length} caracts`,
        onClear: () => setSelected({ ...selected, amenities: [] }),
      });
    return list;
  }, [params, selected]);

  /* side-effect: recarga cada vez que params/selected cambian */
  useMemo(() => {
    apply();
  }, [params, selected]);

  /* ───────── exposición ───────── */
  return {
    params,
    selected,
    operationsList,
    typesList,
    amenitiesList,
    neighborhoodsList,
    toggleParam,
    toggleAmenity,
    setParams,
    apply,
    reset,
    chips,
  };
}
