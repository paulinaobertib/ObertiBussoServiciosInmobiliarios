import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { usePropertyPanel } from "../../hooks/usePropertySection";
import { usePropertiesContext } from "../../context/PropertiesContext";
import type { Property } from "../../types/property";

// ─── mocks ───
vi.mock("../../context/PropertiesContext", () => ({
  usePropertiesContext: vi.fn(),
}));

describe("usePropertyPanel", () => {
  const mockRefreshProperties = vi.fn();

  // Mock completo de Property
  const mockPropertiesList: Property[] = [
    {
      id: 1,
      title: "Propiedad 1",
      description: "desc",
      price: 100,
      area: 50,
      coveredArea: 0,
      expenses: 0,
      currency: "ARS",
      operation: "VENTA",
      status: "DISPONIBLE",
      rooms: 0,
      bedrooms: 0,
      bathrooms: 0,
      credit: false,
      financing: false,
      showPrice: true,
      outstanding: false,
      street: "Calle 1",
      number: "123",
      owner: { id: 1, firstName: "", lastName: "", phone: "", email: "" },
      neighborhood: { id: 1, name: "", city: "", type: "" },
      type: { id: 1, name: "", hasRooms: false, hasBedrooms: false, hasBathrooms: false, hasCoveredArea: false },
      amenities: [],
      mainImage: "",
      images: [],
      date: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Propiedad 2",
      description: "desc",
      price: 200,
      area: 60,
      coveredArea: 0,
      expenses: 0,
      currency: "ARS",
      operation: "VENTA",
      status: "DISPONIBLE",
      rooms: 0,
      bedrooms: 0,
      bathrooms: 0,
      credit: false,
      financing: false,
      showPrice: true,
      outstanding: false,
      street: "Calle 2",
      number: "456",
      owner: { id: 2, firstName: "", lastName: "", phone: "", email: "" },
      neighborhood: { id: 2, name: "", city: "", type: "" },
      type: { id: 2, name: "", hasRooms: false, hasBedrooms: false, hasBathrooms: false, hasCoveredArea: false },
      amenities: [],
      mainImage: "",
      images: [],
      date: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (usePropertiesContext as any).mockReturnValue({
      propertiesList: mockPropertiesList,
      refreshProperties: mockRefreshProperties,
    });
  });

  it("llama a refreshProperties al inicializar", () => {
    renderHook(() => usePropertyPanel());
    expect(mockRefreshProperties).toHaveBeenCalled();
  });

  it("inicializa data y loading correctamente", () => {
    const { result } = renderHook(() => usePropertyPanel());
    expect(result.current.data).toEqual(mockPropertiesList);
    expect(result.current.loading).toBe(false);
  });

  it("onSearch actualiza los datos filtrados", () => {
    const { result } = renderHook(() => usePropertyPanel());
    const filtered = [mockPropertiesList[0]];
    act(() => result.current.onSearch(filtered));
    expect(result.current.data).toEqual(filtered);
  });

  it("toggleSelect selecciona y deselecciona correctamente", () => {
    const { result } = renderHook(() => usePropertyPanel());

    act(() => result.current.toggleSelect(1));
    expect(result.current.isSelected(1)).toBe(true);

    act(() => result.current.toggleSelect(1));
    expect(result.current.isSelected(1)).toBe(false);

    act(() => result.current.toggleSelect(2));
    expect(result.current.isSelected(2)).toBe(true);
  });
});
