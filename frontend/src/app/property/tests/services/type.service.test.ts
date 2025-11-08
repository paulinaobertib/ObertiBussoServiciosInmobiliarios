import { describe, it, expect, vi, beforeEach } from "vitest";
import * as typeService from "../../services/type.service";
import { api } from "../../../../api";
import type { Type, TypeCreate } from "../../types/type";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("typeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockType: Type = {
    id: 1,
    name: "House",
    hasBedrooms: true,
    hasBathrooms: true,
    hasRooms: true,
    hasCoveredArea: true,
  };

  const mockTypeCreate: TypeCreate = {
    name: "Apartment",
    hasBedrooms: true,
    hasBathrooms: true,
    hasRooms: true,
    hasCoveredArea: false,
  };

  it("getAllTypes devuelve todos los tipos", async () => {
    (api.get as any).mockResolvedValue({ data: [mockType] });

    const result = await typeService.getAllTypes();
    expect(api.get).toHaveBeenCalledWith("/properties/type/getAll", { withCredentials: true });
    expect(result).toEqual([mockType]);
  });

  it("getTypeById devuelve un tipo por id", async () => {
    (api.get as any).mockResolvedValue({ data: mockType });

    const result = await typeService.getTypeById(1);
    expect(api.get).toHaveBeenCalledWith("/properties/type/getById/1", { withCredentials: true });
    expect(result).toEqual(mockType);
  });

  it("postType crea un tipo correctamente", async () => {
    (api.post as any).mockResolvedValue({ data: mockType });

    const result = await typeService.postType(mockTypeCreate);
    expect(api.post).toHaveBeenCalledWith("/properties/type/create", mockTypeCreate, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    expect(result).toEqual(mockType);
  });

  it("putType actualiza un tipo correctamente", async () => {
    (api.put as any).mockResolvedValue({ data: mockType });

    const result = await typeService.putType(mockType);
    expect(api.put).toHaveBeenCalledWith("/properties/type/update", mockType, { withCredentials: true });
    expect(result).toEqual(mockType);
  });

  it("deleteType elimina un tipo correctamente", async () => {
    (api.delete as any).mockResolvedValue({ data: "deleted" });

    const result = await typeService.deleteType(mockType);
    expect(api.delete).toHaveBeenCalledWith("/properties/type/delete/1", { withCredentials: true });
    expect(result).toBe("deleted");
  });

  it("getTypesByText busca tipos por texto", async () => {
    (api.get as any).mockResolvedValue({ data: [mockType] });

    const result = await typeService.getTypesByText("House");
    expect(api.get).toHaveBeenCalledWith("/properties/type/search", {
      params: { search: "House" },
      withCredentials: true,
    });
    expect(result).toEqual([mockType]);
  });

  // --- Tests de errores ---
  it("lanza error si api.get falla en getAllTypes", async () => {
    (api.get as any).mockRejectedValue(new Error("Fetch all failed"));
    await expect(typeService.getAllTypes()).rejects.toThrow("Fetch all failed");
  });

  it("lanza error si api.get falla en getTypeById", async () => {
    (api.get as any).mockRejectedValue(new Error("Fetch by ID failed"));
    await expect(typeService.getTypeById(1)).rejects.toThrow("Fetch by ID failed");
  });

  it("lanza error si api.post falla en postType", async () => {
    (api.post as any).mockRejectedValue(new Error("Post failed"));
    await expect(typeService.postType(mockTypeCreate)).rejects.toThrow("Post failed");
  });

  it("lanza error si api.put falla en putType", async () => {
    (api.put as any).mockRejectedValue(new Error("Put failed"));
    await expect(typeService.putType(mockType)).rejects.toThrow("Put failed");
  });

  it("lanza error si api.delete falla en deleteType", async () => {
    (api.delete as any).mockRejectedValue(new Error("Delete failed"));
    await expect(typeService.deleteType(mockType)).rejects.toThrow("Delete failed");
  });

  it("lanza error si api.get falla en getTypesByText", async () => {
    (api.get as any).mockRejectedValue(new Error("Text search failed"));
    await expect(typeService.getTypesByText("House")).rejects.toThrow("Text search failed");
  });
});
