import { vi, describe, it, expect, beforeEach } from "vitest";
import * as ownerService from "../../services/owner.service";
import { api } from "../../../../api";
import type { Owner, OwnerCreate } from "../../types/owner";

const getAllPropertiesMock = vi.fn();

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../services/property.service", () => ({
  getAllProperties: (...args: any[]) => getAllPropertiesMock(...args),
}));

describe("ownerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllPropertiesMock.mockReset();
  });

  it("postOwner llama a api.post con OwnerCreate y devuelve datos", async () => {
    const data: OwnerCreate = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123456789",
    };
    const mockResponse = { data: { id: 1, ...data } };
    (api.post as any).mockResolvedValue(mockResponse);

    const result = await ownerService.postOwner(data);

    expect(api.post).toHaveBeenCalledWith("/properties/owner/create", data, { withCredentials: true });
    expect(result).toEqual(mockResponse.data);
  });

  it("putOwner llama a api.put con Owner y devuelve datos", async () => {
    const data: Owner = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123456789",
    };
    const mockResponse = { data };
    (api.put as any).mockResolvedValue(mockResponse);

    const result = await ownerService.putOwner(data);

    expect(api.put).toHaveBeenCalledWith("/properties/owner/update", data, { withCredentials: true });
    expect(result).toEqual(mockResponse.data);
  });

  it("deleteOwner llama a api.delete con Owner y devuelve datos", async () => {
    const data: Owner = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123456789",
    };
    const mockResponse = { data: { success: true } };
    (api.delete as any).mockResolvedValue(mockResponse);

    const result = await ownerService.deleteOwner(data);

    expect(api.delete).toHaveBeenCalledWith("/properties/owner/delete/1", { withCredentials: true });
    expect(result).toEqual(mockResponse.data);
  });

  it("getAllOwners llama a api.get y devuelve datos", async () => {
    const mockResponse = { data: [] };
    (api.get as any).mockResolvedValue(mockResponse);

    const result = await ownerService.getAllOwners();

    expect(api.get).toHaveBeenCalledWith("/properties/owner/getAll", {
      withCredentials: true,
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("getOwnerById llama a api.get con id", async () => {
    const mockResponse = {
      data: { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com", phone: "123456789" },
    };
    (api.get as any).mockResolvedValue(mockResponse);

    const result = await ownerService.getOwnerById(1);

    expect(api.get).toHaveBeenCalledWith("/properties/owner/getById/1", { withCredentials: true });
    expect(result).toEqual(mockResponse.data);
  });

  it("getOwnerByPropertyId llama a api.get con propertyId", async () => {
    const mockResponse = {
      data: { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com", phone: "123456789" },
    };
    (api.get as any).mockResolvedValue(mockResponse);

    const result = await ownerService.getOwnerByPropertyId(5);

    expect(api.get).toHaveBeenCalledWith("/properties/owner/getByProperty/5", { withCredentials: true });
    expect(result).toEqual(mockResponse.data);
  });

  it("getOwnersByText llama a api.get con search", async () => {
    const mockResponse = {
      data: [{ id: 1, firstName: "John", lastName: "Doe", email: "john@example.com", phone: "123456789" }],
    };
    (api.get as any).mockResolvedValue(mockResponse);

    const result = await ownerService.getOwnersByText("John");

    expect(api.get).toHaveBeenCalledWith("/properties/owner/search", {
      params: { search: "John" },
      withCredentials: true,
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("lanza error si api.post falla en postOwner", async () => {
    const data: OwnerCreate = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "987654321",
    };
    (api.post as any).mockRejectedValue(new Error("Post failed"));
    await expect(ownerService.postOwner(data)).rejects.toThrow("Post failed");
  });

  it("lanza error si api.put falla en putOwner", async () => {
    const data: Owner = {
      id: 1,
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "987654321",
    };
    (api.put as any).mockRejectedValue(new Error("Put failed"));
    await expect(ownerService.putOwner(data)).rejects.toThrow("Put failed");
  });

  it("lanza error si api.delete falla en deleteOwner", async () => {
    const data: Owner = {
      id: 2,
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "987654321",
    };
    (api.delete as any).mockRejectedValue(new Error("Delete failed"));
    await expect(ownerService.deleteOwner(data)).rejects.toThrow("Delete failed");
  });

  it("lanza error si api.get falla en getAllOwners", async () => {
    (api.get as any).mockRejectedValue(new Error("Fetch all failed"));
    await expect(ownerService.getAllOwners()).rejects.toThrow("Fetch all failed");
  });

  it("lanza error si api.get falla en getOwnerById", async () => {
    (api.get as any).mockRejectedValue(new Error("Fetch by ID failed"));
    await expect(ownerService.getOwnerById(1)).rejects.toThrow("Fetch by ID failed");
  });

  it("lanza error si api.get falla en getOwnerByPropertyId", async () => {
    (api.get as any).mockRejectedValue(new Error("Fetch by Property failed"));
    await expect(ownerService.getOwnerByPropertyId(1)).rejects.toThrow("Fetch by Property failed");
  });

  it("lanza error si api.get falla en getOwnersByText", async () => {
    (api.get as any).mockRejectedValue(new Error("Search failed"));
    await expect(ownerService.getOwnersByText("Jane")).rejects.toThrow("Search failed");
  });

  it("getPropertiesByOwner filtra y tolera errores parciales", async () => {
    const properties = Array.from({ length: 10 }, (_, idx) => ({ id: idx + 1, title: `Prop ${idx + 1}` }));
    getAllPropertiesMock.mockResolvedValue({ data: properties });

    const ownerMap: Record<number, number | "error"> = {
      1: 50,
      2: 99,
      3: "error",
      4: 50,
      5: 10,
      6: 50,
      7: 75,
      8: 50,
      9: 50,
      10: 10,
    };

    (api.get as any).mockImplementation((url: string) => {
      const propertyId = Number(url.split("/").pop());
      const owner = ownerMap[propertyId];
      if (owner === "error") {
        return Promise.reject(new Error("owner fetch failed"));
      }
      return Promise.resolve({ data: { id: owner ?? -1 } });
    });

    const result = await ownerService.getPropertiesByOwner(50);

    expect(getAllPropertiesMock).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledTimes(10);
    expect(result.map((p) => p.id)).toEqual([1, 4, 6, 8, 9]);
  });

  it("getPropertiesByOwner acepta listas sin formato y ownerIds distintos", async () => {
    const properties = [{ id: 7 }, { id: 8 }, { id: 9 }];
    getAllPropertiesMock.mockResolvedValue(properties as any);

    (api.get as any).mockImplementation((url: string) => {
      const propertyId = Number(url.split("/").pop());
      return Promise.resolve({ data: { id: propertyId === 8 ? 42 : 100 } });
    });

    const result = await ownerService.getPropertiesByOwner(42);

    expect(result).toEqual([{ id: 8 }]);
  });
});
