/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { PropertyCrudProvider, usePropertiesContext } from "../../context/PropertiesContext";
import { ReactNode } from "react";

// Mock de los servicios
vi.mock("../../services/amenity.service", () => ({
  getAllAmenities: vi.fn().mockResolvedValue([{ id: 1, name: "Piscina" }]),
}));
vi.mock("../../services/owner.service", () => ({
  getAllOwners: vi.fn().mockResolvedValue([{ id: 1, name: "Juan" }]),
}));
vi.mock("../../services/neighborhood.service", () => ({
  getAllNeighborhoods: vi.fn().mockResolvedValue([{ id: 1, name: "Centro" }]),
}));
vi.mock("../../services/type.service", () => ({
  getAllTypes: vi.fn().mockResolvedValue([{ id: 1, name: "Casa" }]),
}));
vi.mock("../../services/property.service", () => ({
  getAllProperties: vi.fn().mockResolvedValue([{ id: 1, title: "Depto" }]),
  getPropertyById: vi.fn().mockResolvedValue({ id: 99, title: "Propiedad Test" }),
}));

function renderContext() {
  return renderHook(() => usePropertiesContext(), {
    wrapper: ({ children }: { children: ReactNode }) => <PropertyCrudProvider>{children}</PropertyCrudProvider>,
  });
}

describe("PropertyCrudContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lanza error si se usa fuera del provider", () => {
    const { result } = renderHook(() => {
      try {
        return usePropertiesContext();
      } catch (e: any) {
        return e.message;
      }
    });
    expect(result.current).toBe("usePropertiesContext debe usarse dentro de PropertyCrudProvider");
  });

  it("puede refrescar amenities", async () => {
    const { result } = renderContext();
    await act(async () => {
      await result.current.refreshAmenities();
    });
    expect(result.current.amenitiesList).toEqual([{ id: 1, name: "Piscina" }]);
  });

  it("puede refrescar owners", async () => {
    const { result } = renderContext();
    await act(async () => {
      await result.current.refreshOwners();
    });
    expect(result.current.ownersList).toEqual([{ id: 1, name: "Juan" }]);
  });

  it("puede refrescar properties", async () => {
    const { result } = renderContext();
    await act(async () => {
      await result.current.refreshProperties();
    });
    expect(result.current.propertiesList).toEqual([{ id: 1, title: "Depto" }]);
  });

  it("puede hacer toggleSelect en amenity", () => {
    const { result } = renderContext();
    act(() => {
      result.current.toggleSelect("amenity", 1);
    });
    expect(result.current.selected.amenities).toContain(1);

    act(() => {
      result.current.toggleSelect("amenity", 1);
    });
    expect(result.current.selected.amenities).not.toContain(1);
  });

  it("puede hacer toggleSelect en owner", () => {
    const { result } = renderContext();
    act(() => {
      result.current.toggleSelect("owner", 5);
    });
    expect(result.current.selected.owner).toBe(5);

    act(() => {
      result.current.toggleSelect("owner", 5);
    });
    expect(result.current.selected.owner).toBeNull();
  });

  it("puede resetSelected", () => {
    const { result } = renderContext();
    act(() => {
      result.current.setSelected({
        owner: 1,
        neighborhood: 2,
        type: 3,
        amenities: [1],
        address: { street: "", number: "", latitude: null, longitude: null },
      });
    });

    act(() => {
      result.current.resetSelected();
    });
    expect(result.current.selected).toEqual({
      owner: null,
      neighborhood: null,
      type: null,
      amenities: [],
      address: { street: "", number: "", latitude: null, longitude: null },
    });
  });

  it("puede cargar propiedad por id", async () => {
    const { result } = renderContext();
    await act(async () => {
      await result.current.loadProperty(99);
    });
    expect(result.current.currentProperty).toEqual({
      id: 99,
      title: "Propiedad Test",
    });
  });

  it("maneja toggleCompare y clearComparison", async () => {
    const { result } = renderContext();
    act(() => {
      result.current.toggleCompare(10);
      result.current.toggleCompare(20);
    });
    expect(result.current.selectedPropertyIds).toEqual([10, 20]);

    act(() => {
      result.current.clearComparison();
    });
    expect(result.current.selectedPropertyIds).toEqual([]);
    expect(result.current.comparisonItems).toEqual([]);
  });
});
