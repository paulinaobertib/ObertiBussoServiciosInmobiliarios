import { useState, useMemo, useEffect, useRef, useCallback } from "react";

import { SearchParams } from "../types/searchParams";
import { Property } from "../types/property";
import { usePropertiesContext } from "../context/PropertiesContext";
import { getPropertiesByFilters } from "../services/property.service";
import { LIMITS } from "../utils/filterLimits";
import { useApiErrors } from "../../shared/hooks/useErrors";
import { formatAmount } from "../../shared/utils/numberFormat";
import { useAuthContext } from "../../user/context/AuthContext";

interface UseSearchFiltersReturn {
  params: {
    rooms: number[];
    types: string[];
    cities: string[];
    neighborhoods: string[];
    neighborhoodTypes: string[];
    operation: string;
    currency: string;
    credit: boolean;
    financing: boolean;
    priceRange: [number, number];
    areaRange: [number, number];
    coveredRange: [number, number];
  };
  dynLimits: {
    price: { USD: { min: number; max: number; step: number }; ARS: { min: number; max: number; step: number } };
    area: { min: number; max: number; step: number };
    covered: { min: number; max: number; step: number };
  };
  selected: any;
  typesList: any[];
  amenitiesList: any[];
  neighborhoodsList: any[];
  toggleParam: any;
  toggleAmenity: any;
  reset: any;
  chips: any[];
  setParams: any;
  apply: any;
  isApplying: boolean;
}

export const useSearchFilters = (onSearch: (r: Property[]) => void): UseSearchFiltersReturn => {
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
    dynamicLimits,
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

  /* ───────── límites dinámicos ───────── */
  // Calculados en el contexto

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
    areaRange: [0, dynamicLimits.area.max] as [number, number],
    coveredRange: [0, dynamicLimits.covered.max] as [number, number],
  });

  // Solo actualizar rangos si el usuario no los ha modificado manualmente
  const initialAreaMaxRef = useRef<number | null>(null);
  const initialCoveredMaxRef = useRef<number | null>(null);

  useEffect(() => {
    // Guardar el valor inicial
    if (initialAreaMaxRef.current === null) {
      initialAreaMaxRef.current = dynamicLimits.area.max;
    }
    if (initialCoveredMaxRef.current === null) {
      initialCoveredMaxRef.current = dynamicLimits.covered.max;
    }

    // Solo actualizar si los rangos están en sus valores por defecto
    setParams((p) => {
      const shouldUpdateArea = p.areaRange[0] === 0 && p.areaRange[1] === (initialAreaMaxRef.current ?? 0);
      const shouldUpdateCovered = p.coveredRange[0] === 0 && p.coveredRange[1] === (initialCoveredMaxRef.current ?? 0);

      if (!shouldUpdateArea && !shouldUpdateCovered) {
        return p; // No cambiar nada si el usuario ya modificó los rangos
      }

      return {
        ...p,
        ...(shouldUpdateArea ? { areaRange: [0, dynamicLimits.area.max] as [number, number] } : {}),
        ...(shouldUpdateCovered ? { coveredRange: [0, dynamicLimits.covered.max] as [number, number] } : {}),
      };
    });

    // Actualizar las referencias
    initialAreaMaxRef.current = dynamicLimits.area.max;
    initialCoveredMaxRef.current = dynamicLimits.covered.max;
  }, [dynamicLimits.area.max, dynamicLimits.covered.max]);

  const prevCurrencyRef = useRef<string>("");

  useEffect(() => {
    if (params.currency === "USD" || params.currency === "ARS") {
      // Solo actualizar si cambió la moneda (no en cada render)
      if (prevCurrencyRef.current !== params.currency) {
        const cfg = dynamicLimits.price[params.currency];
        setParams((p) => ({
          ...p,
          priceRange: [cfg.min, cfg.max] as [number, number],
        }));
        prevCurrencyRef.current = params.currency;
      }
    }
  }, [params.currency, dynamicLimits]);

  const [isApplying, setIsApplying] = useState(false);

  const apply = useCallback(
    async (local = params) => {
      setIsApplying(true);
      setPropertiesLoading(true);
      try {
        const base: Partial<SearchParams> = {
          ...local,
          amenities: selected.amenities.map(String),
          credit: local.operation === "VENTA" ? local.credit || undefined : undefined,
          financing: local.operation === "VENTA" ? local.financing || undefined : undefined,
        };

        if (local.currency) {
          base.priceFrom = local.priceRange[0];
          base.priceTo = local.priceRange[1];
        }

        const isAreaAtMax = local.areaRange[0] === 0 && local.areaRange[1] === dynamicLimits.area.max;
        if (!isAreaAtMax) {
          base.areaFrom = local.areaRange[0];
          base.areaTo = local.areaRange[1];
        }

        const isCoveredAtMax = local.coveredRange[0] === 0 && local.coveredRange[1] === dynamicLimits.covered.max;
        if (!isCoveredAtMax) {
          base.coveredAreaFrom = local.coveredRange[0];
          base.coveredAreaTo = local.coveredRange[1];
        }

        delete base.rooms;
        if (!local.currency) {
          delete (base as any).currency;
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
        setIsApplying(false);
      }
    },
    [
      params,
      selected.amenities,
      dynamicLimits,
      buildSearchParams,
      isAdmin,
      handleError,
      onSearch,
      setPropertiesLoading,
      getPropertiesByFilters,
    ]
  );

  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  }, [apply]);

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

  const skipAmenityAutoApply = useRef(true);
  useEffect(() => {
    if (skipAmenityAutoApply.current) {
      skipAmenityAutoApply.current = false;
      return;
    }
    applyRef.current?.();
  }, [selected.amenities]);

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
      priceRange: [dynamicLimits.price.ARS.min, dynamicLimits.price.ARS.max] as [number, number],
      areaRange: [0, dynamicLimits.area.max] as [number, number],
      coveredRange: [0, dynamicLimits.covered.max] as [number, number],
    };
    setParams(cleared);
    setSelected({
      owner: null,
      neighborhood: null,
      type: null,
      amenities: [],
      address: { street: "", number: "", latitude: null, longitude: null },
    });
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

    // Mostrar chip de precio si hay moneda seleccionada y el rango no está en el valor por defecto
    if (params.currency) {
      const currencyLimits = dynamicLimits.price[params.currency as "USD" | "ARS"];
      const isPriceAtDefault =
        params.priceRange[0] === currencyLimits.min && params.priceRange[1] === currencyLimits.max;

      if (!isPriceAtDefault) {
        out.push({
          label: `Precio ${formatAmount(params.priceRange[0])}-${formatAmount(params.priceRange[1])}`,
          onClear: reset,
        });
      }
    }

    if (params.areaRange[0] > 0 || params.areaRange[1] < dynamicLimits.area.max)
      out.push({
        label: `Sup ${formatAmount(params.areaRange[0])}-${formatAmount(params.areaRange[1])}`,
        onClear: reset,
      });

    if (params.coveredRange[0] > 0 || params.coveredRange[1] < dynamicLimits.covered.max)
      out.push({
        label: `Cub ${formatAmount(params.coveredRange[0])}-${formatAmount(params.coveredRange[1])}`,
        onClear: reset,
      });

    if (selected.amenities.length)
      out.push({
        label: `${selected.amenities.length} caracts`,
        onClear: () => setSelected({ ...selected, amenities: [] }),
      });

    return out;
  }, [params, selected.amenities, dynamicLimits]);

  const dynLimits = dynamicLimits;

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
    isApplying,
  };
};
