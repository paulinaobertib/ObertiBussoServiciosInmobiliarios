import { useState, useMemo, useEffect, useRef } from "react";
import { SearchParams } from "../types/searchParams";
import { Property } from "../types/property";
import { usePropertiesContext } from "../context/PropertiesContext";
import { getPropertiesByFilters } from "../services/property.service";
import { LIMITS } from "../utils/filterLimits";

export const useSearchFilters = (onSearch: (r: Property[]) => void) => {
  const {
    buildSearchParams,
    typesList,
    amenitiesList,
    neighborhoodsList,
    selected,
    setSelected,
    refreshAmenities,
    refreshTypes,
    refreshNeighborhoods,
  } = usePropertiesContext();

  /* ───────── cargar catálogos ───────── */
  useEffect(() => {
    refreshAmenities();
    refreshTypes();
    refreshNeighborhoods();
  }, [refreshAmenities, refreshTypes, refreshNeighborhoods]);

  /* ───────── filtros locales ───────── */
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

  /* ───────── llamada al backend ───────── */
  async function apply(local = params) {
    const base: Partial<SearchParams> = {
      ...local,
      priceFrom: local.priceRange[0],
      priceTo: local.priceRange[1],
      areaFrom: local.areaRange[0],
      areaTo: local.areaRange[1],
      coveredAreaFrom: local.coveredRange[0],
      coveredAreaTo: local.coveredRange[1],
      amenities: selected.amenities.map(String),
      credit:
        local.operation === "VENTA" ? local.credit || undefined : undefined,
      financing:
        local.operation === "VENTA" ? local.financing || undefined : undefined,
    };

    const res = await getPropertiesByFilters(
      buildSearchParams(base) as SearchParams
    );
    onSearch(res);
  }

  /* ───────── disparar búsqueda sólo en cambios reales ───────── */
  const prevParams = useRef(params);
  const prevAmenRefs = useRef(selected.amenities);

  useEffect(() => {
    const paramsChanged = prevParams.current !== params;
    const amenitiesChanged = prevAmenRefs.current !== selected.amenities;

    if (paramsChanged || amenitiesChanged) apply(); // ← sólo si cambió algo

    prevParams.current = params;
    prevAmenRefs.current = selected.amenities;
  }, [params, selected.amenities]);

  /* ───────── helpers de modificación ───────── */
  function toggleParam<
    K extends keyof typeof params,
    V extends (typeof params)[K] extends Array<infer U> ? U : (typeof params)[K]
  >(key: K, value: V) {
    setParams((p) => {
      const cur = p[key] as any;
      return Array.isArray(cur)
        ? {
            ...p,
            [key]: cur.includes(value)
              ? cur.filter((v: any) => v !== value)
              : [...cur, value],
          }
        : { ...p, [key]: cur === value ? "" : value };
    }); // no llamamos apply aquí
  }

  function toggleAmenity(id: number) {
    const list = selected.amenities.includes(id)
      ? selected.amenities.filter((a) => a !== id)
      : [...selected.amenities, id];
    setSelected({ ...selected, amenities: list }); // el useEffect disparará apply
  }

  /* ───────── reset ───────── */
  async function reset() {
    const cleared = {
      ...params,
      rooms: [],
      types: [],
      cities: [],
      neighborhoods: [],
      neighborhoodTypes: [],
      operation: "",
      currency: "",
      credit: false,
      financing: false,
      priceRange: [LIMITS.price.ARS.min, LIMITS.price.ARS.max] as [
        number,
        number
      ],
      areaRange: [LIMITS.surface.min, LIMITS.surface.max] as [number, number],
      coveredRange: [LIMITS.surface.min, LIMITS.surface.max] as [
        number,
        number
      ],
    };
    setParams(cleared);
    setSelected({ owner: null, neighborhood: null, type: null, amenities: [] });
    await apply(cleared); // fuerza búsqueda vacía tras limpiar
  }

  /* ───────── chips (etiquetas) ───────── */
  const chips = useMemo(() => {
    const out: { label: string; onClear(): void }[] = [];
    const push = (lbl: string, k: keyof typeof params, val?: any) =>
      out.push({
        label: lbl,
        onClear: () => toggleParam(k as any, val ?? lbl),
      });

    if (params.operation) push(params.operation, "operation");
    if (params.currency) push(params.currency, "currency");
    if (params.credit) push("Apto Crédito", "credit", true);
    if (params.financing) push("Financiamiento", "financing", true);
    params.types.forEach((t) => push(t, "types", t));
    params.cities.forEach((c) => push(c, "cities", c));
    params.neighborhoods.forEach((n) => push(n, "neighborhoods", n));
    params.neighborhoodTypes.forEach((nt) => push(nt, "neighborhoodTypes", nt));
    params.rooms.forEach((r) => push(r === 3 ? "3+" : `${r}`, "rooms", r));

    const [minP, maxP] = params.priceRange;
    const maxAllowed =
      params.currency === "USD" ? LIMITS.price.USD.max : LIMITS.price.ARS.max;
    if (minP > LIMITS.price.USD.min || maxP < maxAllowed)
      out.push({ label: `Precio ${minP}-${maxP}`, onClear: reset });

    const [minA, maxA] = params.areaRange;
    if (minA > LIMITS.surface.min || maxA < LIMITS.surface.max)
      out.push({ label: `Sup ${minA}-${maxA}`, onClear: reset });

    const [minC, maxC] = params.coveredRange;
    if (minC > LIMITS.surface.min || maxC < LIMITS.surface.max)
      out.push({ label: `Cub ${minC}-${maxC}`, onClear: reset });

    if (selected.amenities.length)
      out.push({
        label: `${selected.amenities.length} caracts`,
        onClear: () => setSelected({ ...selected, amenities: [] }),
      });

    return out;
  }, [params, selected.amenities]);

  /* ───────── exposición ───────── */
  return {
    params,
    selected,
    typesList,
    amenitiesList,
    neighborhoodsList,
    toggleParam,
    toggleAmenity,
    reset,
    chips,
    setParams,
    apply,
  };
};
