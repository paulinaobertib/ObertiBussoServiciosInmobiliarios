import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useSearchFilters } from "../../hooks/useSearchFilters";
import { usePropertiesContext } from "../../context/PropertiesContext";
import { getPropertiesByFilters } from "../../services/property.service";
import type { Property } from "../../types/property";

// ─── mocks ───
vi.mock("../../context/PropertiesContext", () => ({
  usePropertiesContext: vi.fn(),
}));

vi.mock("../../services/property.service", () => ({
  getPropertiesByFilters: vi.fn(),
}));

describe("useSearchFilters", () => {
  const mockRefreshAmenities = vi.fn();
  const mockRefreshTypes = vi.fn();
  const mockRefreshNeighborhoods = vi.fn();
  const mockBuildSearchParams = vi.fn((p: any) => p);
  const mockSetSelected = vi.fn();

  const mockSelected = { owner: null, neighborhood: null, type: null, amenities: [] };
  const mockPropertiesList: Property[] = [
    {
      id: 1,
      title: "Prop 1",
      description: "desc",
      price: 100,
      area: 50,
      coveredArea: 30,
      expenses: 0,
      currency: "ARS",
      operation: "VENTA",
      status: "DISPONIBLE",
      rooms: 2,
      bedrooms: 1,
      bathrooms: 1,
      credit: false,
      financing: false,
      showPrice: true,
      outstanding: false,
      street: "Calle 1",
      number: "123",
      owner: { id: 1, firstName: "", lastName: "", phone: "", email: "" },
      neighborhood: { id: 1, name: "", city: "", type: "" },
      type: { id: 1, name: "", hasRooms: true, hasBedrooms: true, hasBathrooms: true, hasCoveredArea: true },
      amenities: [],
      mainImage: "",
      images: [],
      date: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (usePropertiesContext as any).mockReturnValue({
      buildSearchParams: mockBuildSearchParams,
      typesList: [],
      amenitiesList: [],
      neighborhoodsList: [],
      selected: mockSelected,
      setSelected: mockSetSelected,
      propertiesList: mockPropertiesList,
      refreshAmenities: mockRefreshAmenities,
      refreshTypes: mockRefreshTypes,
      refreshNeighborhoods: mockRefreshNeighborhoods,
    });
    (getPropertiesByFilters as any).mockResolvedValue(mockPropertiesList);
  });

  it("llama a refreshAmenities, refreshTypes y refreshNeighborhoods al montar", () => {
    renderHook(() => useSearchFilters(() => {}));
    expect(mockRefreshAmenities).toHaveBeenCalled();
    expect(mockRefreshTypes).toHaveBeenCalled();
    expect(mockRefreshNeighborhoods).toHaveBeenCalled();
  });

  it("apply llama a getPropertiesByFilters y ejecuta onSearch", async () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useSearchFilters(onSearch));

    await act(async () => {
      await result.current.apply();
    });

    expect(getPropertiesByFilters).toHaveBeenCalled();
    expect(onSearch).toHaveBeenCalledWith(mockPropertiesList);
  });

  it("toggleParam actualiza params", () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useSearchFilters(onSearch));

    act(() => {
      result.current.toggleParam("operation", "VENTA");
    });

    expect(result.current.params.operation).toBe("VENTA");

    act(() => {
      result.current.toggleParam("operation", "VENTA"); // toggle off
    });

    expect(result.current.params.operation).toBe("");
  });

  it("reset limpia params y selected", async () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useSearchFilters(onSearch));

    await act(async () => {
      await result.current.reset();
    });

    expect(result.current.params.rooms).toEqual([]);
    expect(result.current.params.operation).toBe("");
    expect(mockSetSelected).toHaveBeenCalledWith({
      owner: null,
      neighborhood: null,
      type: null,
      amenities: [],
    });
  });

  it("chips devuelve etiquetas basadas en params y selected", () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useSearchFilters(onSearch));

    act(() => {
      result.current.toggleParam("operation", "VENTA");
      result.current.toggleParam("currency", "ARS");
    });

    expect(result.current.chips.some((c) => c.label === "VENTA")).toBe(true);
    expect(result.current.chips.some((c) => c.label === "ARS")).toBe(true);
  });
});
