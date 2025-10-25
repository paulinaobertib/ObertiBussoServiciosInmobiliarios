/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// ---------- Mocks estáticos y valores base ----------

// LIMITS fijos para aserciones sencillas
vi.mock("../../../property/utils/filterLimits", () => ({
  LIMITS: {
    price: { USD: { min: 10000, max: 90000 }, ARS: { min: 1000000, max: 9000000 } },
    surface: { max: 500 },
  },
}));

// Servicio de búsqueda
const getByFiltersMock = vi.fn();
vi.mock("../../../property/services/property.service", () => ({
  getPropertiesByFilters: (...args: any[]) => getByFiltersMock(...args),
}));

// Manejo de errores
const handleErrorMock = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

// Contexto de propiedades: mock dinámico
type Property = {
  id: number;
  price: number;
  currency: "USD" | "ARS";
  area?: number;
  coveredArea?: number;
  rooms?: number | string;
  status?: string;
};

let currentPropsList: Property[] | null = null;
let selectedState = {
  owner: null as any,
  neighborhood: null as any,
  type: null as any,
  amenities: [] as number[],
};

// espías de funciones del contexto
const refreshAmenitiesMock = vi.fn(() => Promise.resolve());
const refreshTypesMock = vi.fn(() => Promise.resolve());
const refreshNeighborhoodsMock = vi.fn(() => Promise.resolve());
const setPropertiesLoadingMock = vi.fn();

// buildSearchParams identidad
const buildSearchParamsMock = vi.fn((x: any) => x);

// setSelected: muta selectedState
const setSelectedMock = vi.fn((next: any) => {
  selectedState = { ...selectedState, ...next };
});

// Listas “catálogo”
const typesListMock = ["Casa", "Depto"];
const amenitiesListMock = [{ id: 1, name: "Ascensor" }, { id: 2, name: "Pileta" }];
const neighborhoodsListMock = ["Centro", "Norte"];

vi.mock("../../../property/context/PropertiesContext", () => ({
  usePropertiesContext: () => ({
    buildSearchParams: buildSearchParamsMock,
    typesList: typesListMock,
    amenitiesList: amenitiesListMock,
    neighborhoodsList: neighborhoodsListMock,

    selected: selectedState,
    setSelected: setSelectedMock,

    propertiesList: currentPropsList,

    refreshAmenities: refreshAmenitiesMock,
    refreshTypes: refreshTypesMock,
    refreshNeighborhoods: refreshNeighborhoodsMock,
    setPropertiesLoading: setPropertiesLoadingMock,
  }),
}));

// Mock AuthContext
let isAdmin = true;
vi.mock("../../../user/context/AuthContext", () => ({
  useAuthContext: () => ({ isAdmin }),
}));

// SUT
import { useSearchFilters } from "../../../property/hooks/useSearchFilters";

// ---------- Helpers ----------
const sampleProps: Property[] = [
  { id: 1, price: 20000, currency: "USD", area: 80, coveredArea: 70, rooms: 2, status: "DISPONIBLE" },
  { id: 2, price: 75000, currency: "USD", area: 120, coveredArea: 100, rooms: 3, status: "DISPONIBLE" },
  { id: 3, price: 2000000, currency: "ARS", area: 60, coveredArea: 55, rooms: 1, status: "DISPONIBLE" },
];

beforeEach(() => {
  vi.clearAllMocks();
  currentPropsList = sampleProps;
  selectedState = { owner: null, neighborhood: null, type: null, amenities: [] };
  isAdmin = true; // default
  setPropertiesLoadingMock.mockImplementation(() => {});
});

// ---------- Tests ----------
describe("useSearchFilters", () => {
  it("al montar, carga catálogos (refresh*) y no llama handleError", async () => {
    const onSearch = vi.fn();

    renderHook(() => useSearchFilters(onSearch));

    await waitFor(() => {
      expect(refreshAmenitiesMock).toHaveBeenCalledTimes(1);
      expect(refreshTypesMock).toHaveBeenCalledTimes(1);
      expect(refreshNeighborhoodsMock).toHaveBeenCalledTimes(1);
    });

    expect(handleErrorMock).not.toHaveBeenCalled();
  });

  it("calcula dynLimits a partir de propertiesList", async () => {
    const { result } = renderHook(() => useSearchFilters(vi.fn()));
    await waitFor(() => {
      const d = result.current.dynLimits;
      expect(d.surface.max).toBeGreaterThan(0);
      expect(d.price.USD.min).toBeLessThanOrEqual(d.price.USD.max);
      expect(d.price.ARS.min).toBeLessThanOrEqual(d.price.ARS.max);
    });
  });

  it("estado inicial de params usa dynLimits.surface.max para area/covered", async () => {
    const { result } = renderHook(() => useSearchFilters(vi.fn()));
    await waitFor(() => {
      expect(result.current.dynLimits.surface.max).toBeGreaterThan(0);
    });
    const max = result.current.dynLimits.surface.max;
    expect(result.current.params.areaRange[1]).toBe(max);
    expect(result.current.params.coveredRange[1]).toBe(max);
  });

  it("toggleParam funciona para arrays y escalares", async () => {
    const { result } = renderHook(() => useSearchFilters(vi.fn()));
    act(() => result.current.toggleParam("types", "Casa"));
    expect(result.current.params.types).toEqual(["Casa"]);
    act(() => result.current.toggleParam("types", "Casa"));
    expect(result.current.params.types).toEqual([]);
    act(() => result.current.toggleParam("currency", "USD"));
    expect(result.current.params.currency).toBe("USD");
    act(() => result.current.toggleParam("currency", "USD"));
    expect(result.current.params.currency).toBe("");
  });

  it("cambia priceRange al cambiar currency", async () => {
    const { result } = renderHook(() => useSearchFilters(vi.fn()));
    await waitFor(() => {
      expect(result.current.dynLimits.price.USD.min).toBeDefined();
    });
    act(() => result.current.toggleParam("currency", "USD"));
    await waitFor(() => {
      expect(result.current.params.priceRange).toEqual([
        result.current.dynLimits.price.USD.min,
        result.current.dynLimits.price.USD.max,
      ]);
    });
    act(() => result.current.toggleParam("currency", "ARS"));
    await waitFor(() => {
      expect(result.current.params.priceRange).toEqual([
        result.current.dynLimits.price.ARS.min,
        result.current.dynLimits.price.ARS.max,
      ]);
    });
  });

  it("toggleAmenity altera selected.amenities y dispara apply", async () => {
    const onSearch = vi.fn();
    getByFiltersMock.mockResolvedValueOnce(sampleProps);

    const { result } = renderHook(() => useSearchFilters(onSearch));
    act(() => result.current.toggleAmenity(1));
    expect(setSelectedMock).toHaveBeenCalledWith({
      ...selectedState,
      amenities: [1],
    });
    await waitFor(() => {
      expect(getByFiltersMock).toHaveBeenCalled();
    });
  });

  it("apply llama servicio y filtra por rooms (incluye 3+)", async () => {
    const onSearch = vi.fn();
    const serviceData: Property[] = [
      { id: 10, price: 10000, currency: "USD", rooms: 1, status: "DISPONIBLE" },
      { id: 11, price: 20000, currency: "USD", rooms: 2, status: "DISPONIBLE" },
      { id: 12, price: 30000, currency: "USD", rooms: 3, status: "DISPONIBLE" },
      { id: 13, price: 40000, currency: "USD", rooms: 4, status: "DISPONIBLE" },
    ];
    getByFiltersMock.mockResolvedValue(serviceData);

    const { result } = renderHook(() => useSearchFilters(onSearch));
    act(() => result.current.toggleParam("operation", "VENTA"));
    act(() => result.current.toggleParam("currency", "USD"));
    act(() => result.current.toggleParam("rooms", 2));
    act(() => result.current.toggleParam("rooms", 3));

    let filtered!: Property[];
    await act(async () => {
      filtered = (await result.current.apply(result.current.params)) as any;
    });

    expect(buildSearchParamsMock).toHaveBeenCalled();
    expect(getByFiltersMock).toHaveBeenCalled();
    expect(filtered.map((p) => p.id)).toEqual([11, 12, 13]);
    expect(onSearch).toHaveBeenCalledWith(filtered);
  });

  it("apply maneja errores → handleError y onSearch([])", async () => {
    const onSearch = vi.fn();
    getByFiltersMock.mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useSearchFilters(onSearch));
    await act(async () => {
      await result.current.apply(result.current.params);
    });
    expect(handleErrorMock).toHaveBeenCalled();
    expect(onSearch).toHaveBeenCalledWith([]);
  });

  it("reset limpia params y selected + dispara apply", async () => {
    const onSearch = vi.fn();
    getByFiltersMock.mockResolvedValue([]);
    const { result } = renderHook(() => useSearchFilters(onSearch));
    act(() => result.current.toggleParam("types", "Casa"));
    act(() => result.current.toggleParam("currency", "ARS"));
    act(() => result.current.toggleAmenity(2));
    await act(async () => {
      await result.current.reset();
    });
    expect(setSelectedMock).toHaveBeenCalledWith({
      owner: null,
      neighborhood: null,
      type: null,
      amenities: [],
    });
    expect(getByFiltersMock).toHaveBeenCalled();
  });

  it("chips se arman y onClear limpia según cada caso", async () => {
    const onSearch = vi.fn();
    getByFiltersMock.mockResolvedValue(sampleProps);
    const { result } = renderHook(() => useSearchFilters(onSearch));
    act(() => result.current.toggleParam("operation", "VENTA"));
    act(() => result.current.toggleParam("currency", "USD"));
    act(() => result.current.toggleParam("credit", true));
    act(() => result.current.toggleParam("financing", true));
    act(() => result.current.toggleParam("types", "Casa"));
    act(() => result.current.toggleParam("cities", "Bahía Blanca"));
    act(() => result.current.toggleParam("neighborhoods", "Centro"));
    act(() => result.current.toggleParam("neighborhoodTypes", "Barrio Privado"));
    act(() => result.current.toggleParam("rooms", 2));
    act(() => result.current.toggleAmenity(1));
    act(() =>
      result.current.setParams((p) => ({
        ...p,
        areaRange: [10, p.areaRange[1] - 1],
      }))
    );
    await waitFor(() => {
      expect(getByFiltersMock).toHaveBeenCalled();
    });
    const labels = result.current.chips.map((c) => c.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        "VENTA",
        "USD",
        "Apto Crédito",
        "Financiamiento",
        "Casa",
        "Bahía Blanca",
        "Centro",
        "Barrio Privado",
        "2",
        expect.stringMatching(/^Sup \d+-\d+$/),
        "1 caracts",
      ])
    );
    const ventaChip = result.current.chips.find((c) => c.label === "VENTA")!;
    act(() => ventaChip.onClear());
    expect(result.current.params.operation).toBe("");
    const amenChip = result.current.chips.find((c) => /caracts$/.test(c.label))!;
    act(() => amenChip.onClear());
    expect(setSelectedMock).toHaveBeenCalledWith({
      ...selectedState,
      amenities: [],
    });
  });
});
