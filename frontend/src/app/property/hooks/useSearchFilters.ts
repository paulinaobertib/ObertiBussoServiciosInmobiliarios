import { useState, useMemo, useEffect, useRef } from "react";

import { SearchParams } from "../types/searchParams";
import { Property } from "../types/property";
import { usePropertiesContext } from "../context/PropertiesContext";
import { getPropertiesByFilters } from "../services/property.service";
import { LIMITS } from "../utils/filterLimits";
import { useApiErrors } from "../../shared/hooks/useErrors";
import { useAuthContext } from "../../user/context/AuthContext";

export const useSearchFilters = (onSearch: (r: Property[]) => void) => {
  const {
    buildSearchParams,
    typesList,
    amenitiesList,
    neighborhoodsList,
    selected,
    setSelected,
    propertiesList,
    refreshAmenities,
    refreshTypes,
    refreshNeighborhoods,
    setPropertiesLoading,
  } = usePropertiesContext();

  const { handleError } = useApiErrors();
  const { isAdmin } = useAuthContext();

  /* ───────── cargar catálogos ───────── */
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([refreshAmenities(), refreshTypes(), refreshNeighborhoods()]);
      } catch (e) {
        handleError(e);
      }
    })();
  }, [refreshAmenities, refreshTypes, refreshNeighborhoods]);

  /* ───────── límites dinámicos (10 pasos, números redondos) ───────── */
  const dynLimits = useMemo(() => {
    const list = propertiesList ?? [];

    const niceStep = (rough: number) => {
      const exp = Math.pow(10, Math.floor(Math.log10(rough)));
      const f = rough / exp;
      const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
      return nice * exp;
    };

    const buildRange = (rawMin: number, rawMax: number) => {
      if (rawMin === rawMax) rawMax = rawMin + 1;
      const step = niceStep((rawMax - rawMin) / 10);
      const min = Math.floor(rawMin / step) * step;
      const max = min + step * 10;
      return { min, max: Math.max(max, rawMax), step };
    };

    const usd = list.filter((p) => p.currency === "USD").map((p) => p.price);
    const ars = list.filter((p) => p.currency === "ARS").map((p) => p.price);

    const usdRange = buildRange(
      usd.length ? Math.min(...usd) : LIMITS.price.USD.min,
      usd.length ? Math.max(...usd) : LIMITS.price.USD.max
    );
    const arsRange = buildRange(
      ars.length ? Math.min(...ars) : LIMITS.price.ARS.min,
      ars.length ? Math.max(...ars) : LIMITS.price.ARS.max
    );

    const areas = list.map((p) => Math.max(p.area ?? 0, p.coveredArea ?? 0));
    const supMax = areas.length ? Math.max(...areas) : LIMITS.surface.max;
    const supRange = buildRange(0, supMax);

    return {
      price: { USD: usdRange, ARS: arsRange },
      surface: supRange,
    };
  }, [propertiesList]);

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
    priceRange: [LIMITS.price.ARS.min, LIMITS.price.ARS.max] as [number, number],
    areaRange: [0, dynLimits.surface.max] as [number, number],
    coveredRange: [0, dynLimits.surface.max] as [number, number],
  });

  useEffect(() => {
    setParams((p) => ({
      ...p,
      areaRange: [0, dynLimits.surface.max] as [number, number],
      coveredRange: [0, dynLimits.surface.max] as [number, number],
    }));
  }, [dynLimits.surface.max]);

  useEffect(() => {
    if (params.currency === "USD" || params.currency === "ARS") {
      const cfg = dynLimits.price[params.currency];
      setParams((p) => ({
        ...p,
        priceRange: [cfg.min, cfg.max] as [number, number],
      }));
    }
  }, [params.currency, dynLimits]);

  /* ───────── llamada al backend ───────── */
  async function apply(local = params) {
    setPropertiesLoading(true);
    try {
      const base: Partial<SearchParams> = {
        ...local,
        priceFrom: local.priceRange[0],
        priceTo: local.priceRange[1],
        areaFrom: local.areaRange[0],
        areaTo: local.areaRange[1],
        coveredAreaFrom: local.coveredRange[0],
        coveredAreaTo: local.coveredRange[1],
        amenities: selected.amenities.map(String),
        credit: local.operation === "VENTA" ? local.credit || undefined : undefined,
        financing: local.operation === "VENTA" ? local.financing || undefined : undefined,
      };
      delete base.rooms;
      if (!local.currency) {
        delete (base as any).currency;
        delete (base as any).priceFrom;
        delete (base as any).priceTo;
      }

      const res = await getPropertiesByFilters(buildSearchParams(base) as SearchParams);

      const availableFiltered = isAdmin
        ? res
        : res.filter((p) => String(p.status ?? "").toUpperCase() === "DISPONIBLE");

      const filtered = local.rooms.length
        ? availableFiltered.filter((p) => {
            const r = Number(p.rooms);
            return local.rooms.some((n) => (n === 3 ? r >= 3 : r === n));
          })
        : availableFiltered;

      onSearch(filtered);
      return filtered;
    } catch (e) {
      handleError(e);
      onSearch([]);
      return [];
    } finally {
      setPropertiesLoading(false);
    }
  }

  /* ───────── disparar búsqueda ante cambios ───────── */
  const prev = useRef({ params, amenities: selected.amenities });
  useEffect(() => {
    if (prev.current.params !== params || prev.current.amenities !== selected.amenities) {
      apply();
    }
    prev.current = { params, amenities: selected.amenities };
  }, [params, selected.amenities]);

  /* ───────── toggles ───────── */
  function toggleParam<
    K extends keyof typeof params,
    V extends (typeof params)[K] extends Array<infer U> ? U : (typeof params)[K]
  >(key: K, value: V) {
    setParams((p) => {
      const cur = p[key] as any;
      if (Array.isArray(cur))
        return {
          ...p,
          [key]: cur.includes(value) ? cur.filter((x: any) => x !== value) : [...cur, value],
        };
      return { ...p, [key]: cur === value ? "" : value };
    });
  }

  function toggleAmenity(id: number) {
    const next = selected.amenities.includes(id)
      ? selected.amenities.filter((a) => a !== id)
      : [...selected.amenities, id];
    setSelected({ ...selected, amenities: next });
  }

  /* ───────── reset ───────── */
  async function reset() {
    const cleared = {
      rooms: [],
      types: [],
      cities: [],
      neighborhoods: [],
      neighborhoodTypes: [],
      operation: "",
      currency: "",
      credit: false,
      financing: false,
      priceRange: [dynLimits.price.ARS.min, dynLimits.price.ARS.max] as [number, number],
      areaRange: [0, dynLimits.surface.max] as [number, number],
      coveredRange: [0, dynLimits.surface.max] as [number, number],
    };
    setParams(cleared);
    setSelected({ owner: null, neighborhood: null, type: null, amenities: [], address: { street: "", number: "", latitude: null, longitude: null } });
    await apply(cleared as any);
  }

  /* ───────── chips (etiquetas) ───────── */
  const chips = useMemo(() => {
    const out: { label: string; onClear(): void }[] = [];
    const push = (lbl: string, k: keyof typeof params, val?: any) =>
      out.push({ label: lbl, onClear: () => toggleParam(k as any, val ?? lbl) });

    if (params.operation) push(params.operation, "operation");
    if (params.currency) push(params.currency, "currency");
    if (params.credit) push("Apto Crédito", "credit", true);
    if (params.financing) push("Financiamiento", "financing", true);
    params.types.forEach((t) => push(t, "types", t));
    params.cities.forEach((c) => push(c, "cities", c));
    params.neighborhoods.forEach((n) => push(n, "neighborhoods", n));
    params.neighborhoodTypes.forEach((nt) => push(nt, "neighborhoodTypes", nt));
    params.rooms.forEach((r) => push(r === 3 ? "3+" : `${r}`, "rooms", r));

    if (
      params.currency &&
      (params.priceRange[0] > dynLimits.price.ARS.min || params.priceRange[1] < dynLimits.price.ARS.max)
    ) {
      out.push({ label: `Precio ${params.priceRange[0]}-${params.priceRange[1]}`, onClear: reset });
    }
    if (params.areaRange[0] > 0 || params.areaRange[1] < dynLimits.surface.max)
      out.push({ label: `Sup ${params.areaRange[0]}-${params.areaRange[1]}`, onClear: reset });

    if (params.coveredRange[0] > 0 || params.coveredRange[1] < dynLimits.surface.max)
      out.push({ label: `Cub ${params.coveredRange[0]}-${params.coveredRange[1]}`, onClear: reset });

    if (selected.amenities.length)
      out.push({
        label: `${selected.amenities.length} caracts`,
        onClear: () => setSelected({ ...selected, amenities: [] }),
      });

    return out;
  }, [params, selected.amenities, dynLimits]);

  return {
    params,
    dynLimits,
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
