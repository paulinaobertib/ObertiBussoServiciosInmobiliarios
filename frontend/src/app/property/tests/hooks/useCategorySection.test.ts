/// <reference types="vitest" />
import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCategorySection } from "../../../property/hooks/useCategorySection";
import type { Category } from "../../../property/context/PropertiesContext";

// ================= Mocks =================
const toggleSelectMock = vi.fn();
const refreshOwnersMock = vi.fn(() => Promise.resolve());
const refreshAmenitiesMock = vi.fn(() => Promise.resolve());
const refreshTypesMock = vi.fn(() => Promise.resolve());
const refreshNeighborhoodsMock = vi.fn(() => Promise.resolve());

const handleErrorMock = vi.fn();

vi.mock("../../../property/context/PropertiesContext", () => ({
  usePropertiesContext: () => ({
    ownersList: [{ id: 1, firstName: "John", lastName: "Doe" }],
    amenitiesList: [{ id: 2, name: "Pool" }],
    typesList: [{ id: 3, name: "House" }],
    neighborhoodsList: [{ id: 4, name: "Centro" }],
    selected: { owner: 1, amenities: [2], type: 3, neighborhood: 4 },
    toggleSelect: toggleSelectMock,
    refreshOwners: refreshOwnersMock,
    refreshAmenities: refreshAmenitiesMock,
    refreshTypes: refreshTypesMock,
    refreshNeighborhoods: refreshNeighborhoodsMock,
  }),
}));

vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({
    handleError: handleErrorMock,
  }),
}));

// ================= Tests =================
describe("useCategorySection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

it("inicializa correctamente con categoría owner", async () => {
  const category: Category = "owner";
  const { result } = renderHook(() => useCategorySection(category));

  // loading inicial
  expect(result.current.loading).toBe(true);

  // Ejecutar refresh
  await act(async () => {
    await result.current.refresh();
  });

  // refreshOwners se llama y loading queda false
  expect(refreshOwnersMock).toHaveBeenCalled();
  expect(result.current.loading).toBe(false);

  // tableData mapea fullName para owner
  expect(result.current.data[0].fullName).toBe("John Doe");

  // isSelected funciona
  expect(result.current.isSelected(1)).toBe(true);
  expect(result.current.isSelected(999)).toBe(false);

  // toggleSelect llama al contexto
  result.current.toggleSelect(1);
  expect(toggleSelectMock).toHaveBeenCalledWith("owner", 1);
});

  it("cambia category y actualiza data y searchResults", () => {
    type HookProps = { cat: Category };

    const { result, rerender } = renderHook(
      ({ cat }: HookProps) => useCategorySection(cat),
      { initialProps: { cat: "owner" } }
    );

    expect(result.current.data[0].fullName).toBe("John Doe");

    // Cambiar categoría a amenity
    rerender({ cat: "amenity" });

    expect(result.current.data).toEqual([{ id: 2, name: "Pool" }]);
    expect(result.current.isSelected(2)).toBe(true);
  });

  it("tableData devuelve directamente data para no-owner", () => {
    const category: Category = "type";
    const { result } = renderHook(() => useCategorySection(category));
    expect(result.current.data).toEqual([{ id: 3, name: "House" }]);
  });
});
