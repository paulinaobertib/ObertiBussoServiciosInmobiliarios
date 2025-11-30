/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { PropertyCrudProvider, usePropertiesContext } from "../../context/PropertiesContext";
import { ReactNode } from "react";

// Mock de AuthContext
vi.mock("../../../user/context/AuthContext", () => ({
  useAuthContext: vi.fn().mockReturnValue({ isAdmin: false, info: null }),
}));

// Mock de los servicios
const getAllAmenitiesMock = vi.fn().mockResolvedValue([{ id: 1, name: "Piscina" }]);
const getAllOwnersMock = vi.fn().mockResolvedValue([{ id: 1, name: "Juan" }]);
const getAllNeighborhoodsMock = vi.fn().mockResolvedValue([{ id: 1, name: "Centro" }]);
const getAllTypesMock = vi.fn().mockResolvedValue([{ id: 1, name: "Casa" }]);
const getAllPropertiesMock = vi.fn().mockResolvedValue([{ id: 1, title: "Depto" }]);
const getAvailablePropertiesMock = vi.fn().mockResolvedValue([{ id: 1, title: "Depto" }]);
const getPropertyByIdMock = vi.fn().mockResolvedValue({ id: 99, title: "Propiedad Test" });

vi.mock("../../services/amenity.service", () => ({
  getAllAmenities: (...args: any[]) => getAllAmenitiesMock(...args),
}));
vi.mock("../../services/owner.service", () => ({
  getAllOwners: (...args: any[]) => getAllOwnersMock(...args),
}));
vi.mock("../../services/neighborhood.service", () => ({
  getAllNeighborhoods: (...args: any[]) => getAllNeighborhoodsMock(...args),
}));
vi.mock("../../services/type.service", () => ({
  getAllTypes: (...args: any[]) => getAllTypesMock(...args),
}));
vi.mock("../../services/property.service", () => ({
  getAllProperties: (...args: any[]) => getAllPropertiesMock(...args),
  getAvailableProperties: (...args: any[]) => getAvailablePropertiesMock(...args),
  getPropertyById: (...args: any[]) => getPropertyByIdMock(...args),
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
      await result.current.refreshProperties("all");
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

  it("buildSearchParams mapea amenidades por nombre", async () => {
    const { result } = renderContext();
    await act(async () => {
      await result.current.refreshAmenities();
    });

    act(() => {
      result.current.toggleSelect("amenity", 1);
    });
    const params = result.current.buildSearchParams({ priceFrom: 100 });
    expect(params.amenities).toEqual(["Piscina"]);
  });

  it("setAddress actualiza estado y cambiar barrio resetea dirección", () => {
    const { result } = renderContext();
    act(() => {
      result.current.setAddress({ street: "Av", number: "123", latitude: 1, longitude: 2 });
    });
    expect(result.current.selected.address).toEqual({ street: "Av", number: "123", latitude: 1, longitude: 2 });

    act(() => {
      result.current.toggleSelect("neighborhood", 5);
    });
    expect(result.current.selected.address).toEqual({ street: "", number: "", latitude: null, longitude: null });
  });

  it("seedSelectionsFromProperty replica datos y limpia cuando recibe null", () => {
    const { result } = renderContext();
    const prop: any = {
      owner: { id: 3 },
      neighborhood: { id: 4 },
      type: { id: 5 },
      amenities: [{ id: 6 }],
      street: "Main",
      number: "77",
      latitude: -1,
      longitude: -2,
    };
    act(() => {
      result.current.seedSelectionsFromProperty(prop);
    });
    expect(result.current.selected).toMatchObject({
      owner: 3,
      neighborhood: 4,
      type: 5,
      amenities: [6],
      address: { street: "Main", number: "77", latitude: -1, longitude: -2 },
    });

    act(() => {
      result.current.seedSelectionsFromProperty(null);
    });
    expect(result.current.selected.owner).toBeNull();
    expect(result.current.selected.amenities).toEqual([]);
  });

  it("refreshProperties permite modo available", async () => {
    const { result } = renderContext();
    await act(async () => {
      await result.current.refreshProperties("available");
    });
    expect(getAvailablePropertiesMock).toHaveBeenCalled();
  });

  it("loadComparisonItems carga ids válidos y omite errores", async () => {
    const { result } = renderContext();
    getPropertyByIdMock.mockImplementation(async (id: number) => {
      if (id === 2) throw new Error("fail");
      return { id, title: `Prop ${id}` };
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      await result.current.loadComparisonItems([1, 2]);
    });

    expect(result.current.comparisonItems).toEqual([{ id: 1, title: "Prop 1" }]);
    errorSpy.mockRestore();
  });
});
