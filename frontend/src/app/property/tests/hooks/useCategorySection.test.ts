/// <reference types="vitest" />
import { renderHook, act } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { useCategorySection } from "../../hooks/useCategorySection";
import { usePropertiesContext } from "../../context/PropertiesContext";

// ----- Mock del contexto -----
const mockToggleSelect = vi.fn();
const mockRefreshOwners = vi.fn().mockResolvedValue(undefined);
const mockRefreshAmenities = vi.fn().mockResolvedValue(undefined);
const mockRefreshTypes = vi.fn().mockResolvedValue(undefined);
const mockRefreshNeighborhoods = vi.fn().mockResolvedValue(undefined);

vi.mock("../../context/PropertiesContext", () => ({
  usePropertiesContext: vi.fn(),
  Category: {},
}));

describe("useCategorySection", () => {
  const selected = {
    owner: 1,
    neighborhood: 2,
    type: 3,
    amenities: [10, 20],
  };

  const ownersList = [
    { id: 1, firstName: "John", lastName: "Doe" },
    { id: 2, firstName: "Jane", lastName: "Smith" },
  ];
  const amenitiesList = [{ id: 10, name: "Piscina" }, { id: 20, name: "Gimnasio" }];
  const typesList = [{ id: 3, name: "Casa" }];
  const neighborhoodsList = [{ id: 2, name: "Palermo" }];

  beforeEach(() => {
    vi.clearAllMocks();
    (usePropertiesContext as Mock).mockReturnValue({
      ownersList,
      amenitiesList,
      typesList,
      neighborhoodsList,
      selected,
      toggleSelect: mockToggleSelect,
      refreshOwners: mockRefreshOwners,
      refreshAmenities: mockRefreshAmenities,
      refreshTypes: mockRefreshTypes,
      refreshNeighborhoods: mockRefreshNeighborhoods,
    });
  });

  it("devuelve datos y fullName para owners", async () => {
    const { result } = renderHook(() =>
      useCategorySection("owner")
    );

    // Esperamos que termine el refresh
    await act(async () => {});

    expect(result.current.data).toEqual([
      { ...ownersList[0], fullName: "John Doe" },
      { ...ownersList[1], fullName: "Jane Smith" },
    ]);
    expect(result.current.loading).toBe(false);
  });

  it("devuelve datos correctamente para amenities", async () => {
    const { result } = renderHook(() => useCategorySection("amenity"));

    expect(result.current.data).toEqual(amenitiesList);
  });

  it("isSelected funciona correctamente", () => {
    const { result } = renderHook(() => useCategorySection("owner"));
    expect(result.current.isSelected(1)).toBe(true);
    expect(result.current.isSelected(2)).toBe(false);

    const hookAmenity = renderHook(() => useCategorySection("amenity")).result;
    expect(hookAmenity.current.isSelected(10)).toBe(true);
    expect(hookAmenity.current.isSelected(30)).toBe(false);
  });

  it("toggleSelect llama al contexto con la categoría correcta", () => {
    const { result } = renderHook(() => useCategorySection("amenity"));

    act(() => {
      result.current.toggleSelect(10);
    });

    expect(mockToggleSelect).toHaveBeenCalledWith("amenity", 10);
  });

  it("refresh llama a la función de refresco correspondiente", async () => {
    const { result } = renderHook(() => useCategorySection("amenity"));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRefreshAmenities).toHaveBeenCalled();
  });

  it("onSearch actualiza los resultados de búsqueda", () => {
    const { result } = renderHook(() => useCategorySection("type"));
    act(() => {
      result.current.onSearch([{ id: 99, name: "Test" }]);
    });

    expect(result.current.data).toEqual([{ id: 99, name: "Test" }]);
  });
});
