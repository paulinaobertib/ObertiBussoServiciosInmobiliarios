import { describe, it, expect, vi, beforeEach } from "vitest";
import * as propertyService from "../../services/property.service";
import { api } from "../../../../api";
import type { Property, PropertyUpdate, PropertyCreate } from "../../types/property";
import type { SearchParams } from "../../types/searchParams";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("propertyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Mock completo con todos los campos obligatorios
  const mockProperty: Property = {
    id: 1,
    title: "Casa",
    street: "Calle Falsa",
    number: "123",
    description: "Hermosa casa",
    status: "ACTIVE",
    operation: "SALE",
    currency: "USD",
    rooms: 3,
    bathrooms: 2,
    bedrooms: 3,
    area: 120,
    coveredArea: 100,
    price: 100000,
    expenses: null,
    showPrice: true,
    credit: false,
    financing: false,
    outstanding: false,
    owner: { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com", phone: "123456789" },
    neighborhood: {
      id: 1,
      name: "Centro",
      city: "Ciudad X",
      type: "",
    },
    type: {
      id: 1,
      name: "House",
      hasBedrooms: true,
      hasBathrooms: true,
      hasRooms: true,
      hasCoveredArea: true,
    },
    amenities: [],
    mainImage: new File([], "main.jpg"),
    images: [],
    date: new Date().toISOString(),
  };

  const mockSearchParams: SearchParams = {
    priceFrom: 50000,
    priceTo: 150000,
    areaFrom: 0,
    areaTo: 500,
    coveredAreaFrom: 0,
    coveredAreaTo: 300,
    rooms: [2, 3],
    operation: "SALE",
    types: ["House", "Apartment"],
    amenities: [],
    cities: ["Ciudad X"],
    neighborhoods: ["Centro"],
    neighborhoodTypes: [""],
    currency: "USD",
  };

  const mockPropertyCreate: PropertyCreate = {
    title: "Departamento",
    street: "Calle Falsa",
    number: "456",
    description: "Nuevo",
    status: "ACTIVE",
    operation: "SALE",
    currency: "USD",
    rooms: 2,
    bathrooms: 1,
    bedrooms: 2,
    area: 80,
    coveredArea: 70,
    price: 50000,
    expenses: null,
    showPrice: true,
    credit: false,
    financing: false,
    outstanding: false,
    ownerId: 1,
    neighborhoodId: 1,
    typeId: 1,
    amenitiesIds: [],
    mainImage: new File([], "main.jpg"),
    images: [new File([], "img1.jpg")],
  };

  const mockPropertyUpdate: PropertyUpdate = {
    id: 1,
    title: "Casa actualizada",
    street: "Calle Falsa",
    number: "123",
    description: "Actualizada",
    status: "ACTIVE",
    operation: "SALE",
    currency: "USD",
    rooms: 3,
    bathrooms: 2,
    bedrooms: 3,
    area: 120,
    coveredArea: 100,
    price: 120000,
    expenses: null,
    showPrice: true,
    credit: false,
    financing: false,
    outstanding: true,
    ownerId: 1,
    neighborhoodId: 1,
    typeId: 1,
    amenitiesIds: [],
    mainImage: new File([], "main_updated.jpg"),
  };

  it("postProperty crea propiedad correctamente", async () => {
    (api.post as any).mockResolvedValue({ data: mockPropertyCreate });

    const result = await propertyService.postProperty(mockPropertyCreate);
    expect(api.post).toHaveBeenCalled();
    expect(result.data).toEqual(mockPropertyCreate);
    expect(result.status).toBeUndefined();
  });

  it("putProperty actualiza propiedad correctamente", async () => {
    (api.put as any).mockResolvedValue({ data: mockPropertyUpdate });

    const result = await propertyService.putProperty(mockPropertyUpdate);
    expect(api.put).toHaveBeenCalled();
    expect(result).toEqual(mockPropertyUpdate);
  });

  it("deleteProperty elimina propiedad correctamente", async () => {
    (api.delete as any).mockResolvedValue({ data: "deleted" });

    const result = await propertyService.deleteProperty(mockProperty);
    expect(api.delete).toHaveBeenCalledWith(`/properties/property/delete/1`, { withCredentials: true });
    expect(result).toBe("deleted");
  });

  it("getAllProperties devuelve todas las propiedades", async () => {
    (api.get as any).mockResolvedValue({ data: [mockProperty] });

    const result = await propertyService.getAllProperties();
    expect(api.get).toHaveBeenCalledWith("/properties/property/getAll", { withCredentials: true });
    expect(result).toEqual([mockProperty]);
  });

  it("getPropertyById devuelve propiedad por id", async () => {
    (api.get as any).mockResolvedValue({ data: mockProperty });

    const result = await propertyService.getPropertyById(1);
    expect(api.get).toHaveBeenCalledWith("/properties/property/getById/1", { withCredentials: true });
    expect(result).toEqual(mockProperty);
  });

  it("getPropertiesByFilters devuelve propiedades filtradas", async () => {
    (api.get as any).mockResolvedValue({ data: [mockProperty] });

    const result = await propertyService.getPropertiesByFilters(mockSearchParams);
    expect(api.get).toHaveBeenCalled();
    expect(result).toEqual([mockProperty]);
  });

  it("getPropertiesByText busca propiedades por texto", async () => {
    (api.get as any).mockResolvedValue({ data: [mockProperty] });

    const result = await propertyService.getPropertiesByText("Casa");
    expect(api.get).toHaveBeenCalledWith("/properties/property/text", {
      params: { value: "Casa" },
      withCredentials: true,
    });
    expect(result).toEqual([mockProperty]);
  });

  it("putPropertyStatus actualiza status", async () => {
    (api.put as any).mockResolvedValue({ data: { success: true } });

    const result = await propertyService.putPropertyStatus(1, "INACTIVE");
    expect(api.put).toHaveBeenCalledWith("/properties/property/status/1", null, {
      params: { status: "INACTIVE" },
      withCredentials: true,
    });
    expect(result).toEqual({ success: true });
  });

  it("putPropertyOutstanding actualiza outstanding", async () => {
    (api.put as any).mockResolvedValue({ data: { success: true } });

    const result = await propertyService.putPropertyOutstanding(1, true);
    expect(api.put).toHaveBeenCalledWith("/properties/property/outstanding/1", null, {
      params: { outstanding: true },
      withCredentials: true,
    });
    expect(result).toEqual({ success: true });
  });

  // --- Tests de errores ---
  it("lanza error si api.post falla en postProperty", async () => {
    (api.post as any).mockRejectedValue(new Error("Post failed"));
    await expect(propertyService.postProperty(mockPropertyCreate)).rejects.toThrow("Post failed");
  });

  it("lanza error si api.put falla en putProperty", async () => {
    (api.put as any).mockRejectedValue(new Error("Put failed"));
    await expect(propertyService.putProperty(mockPropertyUpdate)).rejects.toThrow("Put failed");
  });

  it("lanza error si api.delete falla en deleteProperty", async () => {
    (api.delete as any).mockRejectedValue(new Error("Delete failed"));
    await expect(propertyService.deleteProperty(mockProperty)).rejects.toThrow("Delete failed");
  });

  it("lanza error si api.get falla en getAllProperties", async () => {
    (api.get as any).mockRejectedValue(new Error("Fetch all failed"));
    await expect(propertyService.getAllProperties()).rejects.toThrow("Fetch all failed");
  });

  it("lanza error si api.get falla en getPropertyById", async () => {
    (api.get as any).mockRejectedValue(new Error("Fetch by ID failed"));
    await expect(propertyService.getPropertyById(1)).rejects.toThrow("Fetch by ID failed");
  });

  it("lanza error si api.get falla en getPropertiesByText", async () => {
    (api.get as any).mockRejectedValue(new Error("Text search failed"));
    await expect(propertyService.getPropertiesByText("Casa")).rejects.toThrow("Text search failed");
  });

  it("lanza error si api.put falla en putPropertyStatus", async () => {
    (api.put as any).mockRejectedValue(new Error("Status update failed"));
    await expect(propertyService.putPropertyStatus(1, "INACTIVE")).rejects.toThrow("Status update failed");
  });

  it("lanza error si api.put falla en putPropertyOutstanding", async () => {
    (api.put as any).mockRejectedValue(new Error("Outstanding update failed"));
    await expect(propertyService.putPropertyOutstanding(1, true)).rejects.toThrow("Outstanding update failed");
  });
});
