import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  postProperty,
  putProperty,
  deleteProperty,
  getAllProperties,
  getPropertyById,
  getPropertiesByFilters,
  getPropertiesByText,
  putPropertyStatus,
} from "../../services/property.service";
import { PropertyCreate, PropertyUpdate, Property } from "../../types/property";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const apiUrl = import.meta.env.VITE_API_URL;

const fullPropertyCreate: PropertyCreate = {
  title: "Casa Moderna",
  street: "Mitre",
  number: "123",
  description: "Una casa moderna con jardín y pileta",
  status: "disponible",
  operation: "venta",
  currency: "USD",
  rooms: 5,
  bathrooms: 2,
  bedrooms: 4,
  area: 300,
  coveredArea: 250,
  price: 250000,
  showPrice: true,
  credit: true,
  financing: false,
  ownerId: 1,
  neighborhoodId: 2,
  typeId: 3,
  amenitiesIds: [1, 2, 3],
  mainImage: new File(["main"], "main.jpg", { type: "image/jpeg" }),
  images: [
    new File(["img1"], "img1.jpg", { type: "image/jpeg" }),
    new File(["img2"], "img2.jpg", { type: "image/jpeg" }),
  ],
};

const fullPropertyUpdate: PropertyUpdate = {
  id: 123,
  title: "Casa Remodelada",
  street: "San Martín",
  number: "456",
  description: "Casa remodelada con mejoras",
  status: "vendido",
  operation: "venta",
  currency: "USD",
  rooms: 5,
  bathrooms: 3,
  bedrooms: 4,
  area: 320,
  coveredArea: 280,
  price: 300000,
  showPrice: false,
  credit: false,
  financing: true,
  ownerId: 2,
  neighborhoodId: 3,
  typeId: 4,
  amenitiesIds: [2, 4],
  mainImage: new File(["main"], "main-update.jpg", { type: "image/jpeg" }),
};

describe("property.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea una propiedad con todos los campos válidos", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 1 } });

    const result = await postProperty(fullPropertyCreate);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiUrl}/properties/property/create`,
      expect.any(FormData)
    );
    expect(result).toEqual({ id: 1 });
  });

  it("lanza error al crear propiedad", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Error de red"));
    await expect(postProperty(fullPropertyCreate)).rejects.toThrow("Error de red");
  });

  it("actualiza una propiedad con todos los campos válidos", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } });

    const result = await putProperty(fullPropertyUpdate);

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${apiUrl}/properties/property/update/123`,
      expect.any(FormData),
      expect.any(Object)
    );
    expect(result).toEqual({ success: true });
  });

  it("lanza error al actualizar propiedad", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Error de red"));

    await expect(putProperty(fullPropertyUpdate)).rejects.toThrow("Error de red");
  });

  it("elimina una propiedad", async () => {
    const property: Property = { id: 1 } as Property;
    mockedAxios.delete.mockResolvedValue({ data: "deleted" });

    const result = await deleteProperty(property);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${apiUrl}/properties/property/delete/1`
    );
    expect(result).toBe("deleted");
  });

  it("lanza error al eliminar propiedad", async () => {
    const property: Property = { id: 1 } as Property;
    mockedAxios.delete.mockRejectedValue(new Error("Error de red"));

    await expect(deleteProperty(property)).rejects.toThrow("Error de red");
  });

  it("obtiene todas las propiedades", async () => {
    mockedAxios.get.mockResolvedValue({ data: ["property1", "property2"] });

    const result = await getAllProperties();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/property/getAll`
    );
    expect(result).toEqual(["property1", "property2"]);
  });

  it("lanza error al obtener todas las propiedades", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    await expect(getAllProperties()).rejects.toThrow("Error de red");
  });

  it("obtiene una propiedad por id", async () => {
    mockedAxios.get.mockResolvedValue({ data: { id: 1 } });

    const result = await getPropertyById(1);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/property/getById/1`
    );
    expect(result).toEqual({ id: 1 });
  });

  it("lanza error al obtener propiedad por id", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    await expect(getPropertyById(1)).rejects.toThrow("Error de red");
  });

  it("obtiene propiedades por filtros completos", async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ id: 1 }] });

    const filters = {
      priceFrom: 100000,
      priceTo: 300000,
      areaFrom: 50,
      areaTo: 500,
      coveredAreaFrom: 30,
      coveredAreaTo: 400,
      rooms: 3,
      operation: "venta",
      type: "casa",
      amenities: ["pileta", "jardin"],
      city: "Buenos Aires",
      neighborhood: "Palermo",
      neighborhoodType: "residencial",
      credit: true,
      financing: false,
    };

    const result = await getPropertiesByFilters(filters);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining(`${apiUrl}/properties/property/search?`)
    );
    expect(result).toEqual([{ id: 1 }]);
  });

  it("lanza error al buscar propiedades por filtros", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    const filters = {
      priceFrom: 100000,
      priceTo: 300000,
      areaFrom: 50,
      areaTo: 500,
      coveredAreaFrom: 30,
      coveredAreaTo: 400,
      rooms: 3,
      operation: "venta",
      type: "casa",
      amenities: ["pileta", "jardin"],
      city: "Buenos Aires",
      neighborhood: "Palermo",
      neighborhoodType: "residencial",
      credit: true,
      financing: false,
    };

    await expect(getPropertiesByFilters(filters)).rejects.toThrow("Error de red");
  });

  it("obtiene propiedades por texto", async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ id: 1 }] });

    const result = await getPropertiesByText("casa");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/property/text?`,
      { params: { value: "casa" } }
    );
    expect(result).toEqual([{ id: 1 }]);
  });

  it("lanza error al buscar propiedades por texto", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    await expect(getPropertiesByText("casa")).rejects.toThrow("Error de red");
  });

  it("actualiza el estado de una propiedad", async () => {
    mockedAxios.put.mockResolvedValue({ data: { status: "activo" } });

    const result = await putPropertyStatus(1, "activo");

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${apiUrl}/properties/property/status/1`,
      null,
      { params: { status: "activo" } }
    );
    expect(result).toEqual({ status: "activo" });
  });

  it("lanza error al actualizar estado de propiedad", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Error de red"));

    await expect(putPropertyStatus(1, "activo")).rejects.toThrow("Error de red");
  });
});
