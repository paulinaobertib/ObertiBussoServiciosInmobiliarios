import { vi, describe, it, expect, beforeEach } from "vitest";
import * as neighborhoodService from "../../services/neighborhood.service";
import { api } from "../../../../api";
import { NeighborhoodType } from "../../types/neighborhood";
import type { Neighborhood, NeighborhoodCreate } from "../../types/neighborhood";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("neighborhoodService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllNeighborhoods llama a api.get y devuelve datos", async () => {
    const mockResponse = { data: [] };
    (api.get as any).mockResolvedValue(mockResponse);

    const result = await neighborhoodService.getAllNeighborhoods();

    expect(api.get).toHaveBeenCalledWith("/properties/neighborhood/getAll", {
      withCredentials: true,
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("getNeighborhoodById llama a api.get con id", async () => {
    const mockResponse = { data: { id: 1, name: "Centro", city: "Ciudad", type: "" } };
    (api.get as any).mockResolvedValue(mockResponse);

    const result = await neighborhoodService.getNeighborhoodById(1);

    expect(api.get).toHaveBeenCalledWith("/properties/neighborhood/getById/1", { withCredentials: true });
    expect(result).toEqual(mockResponse.data);
  });

  it("postNeighborhood llama a api.post y devuelve datos", async () => {
    const data: NeighborhoodCreate = {
      name: "Barrio Nuevo",
      city: "Ciudad",
      type: NeighborhoodType.ABIERTO,
    };
    const mockResponse = { data: { id: 2, ...data } };
    (api.post as any).mockResolvedValue(mockResponse);

    const result = await neighborhoodService.postNeighborhood(data);

    expect(api.post).toHaveBeenCalledWith("/properties/neighborhood/create", data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("putNeighborhood llama a api.put y devuelve datos", async () => {
    const data: Neighborhood = {
      id: 1,
      name: "Centro Actualizado",
      city: "Ciudad",
      type: NeighborhoodType.CERRADO, // <-- Usar el enum
    };
    const mockResponse = { data };
    (api.put as any).mockResolvedValue(mockResponse);

    const result = await neighborhoodService.putNeighborhood(data);

    expect(api.put).toHaveBeenCalledWith("/properties/neighborhood/update/1", data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("deleteNeighborhood llama a api.delete y devuelve datos", async () => {
    const data: Neighborhood = {
      id: 1,
      name: "Centro",
      city: "Ciudad",
      type: NeighborhoodType.ABIERTO, // <-- Usar el enum
    };
    const mockResponse = { data: { success: true } };
    (api.delete as any).mockResolvedValue(mockResponse);

    const result = await neighborhoodService.deleteNeighborhood(data);

    expect(api.delete).toHaveBeenCalledWith("/properties/neighborhood/delete/1", { withCredentials: true });
    expect(result).toEqual(mockResponse.data);
  });

  it("getNeighborhoodByText llama a api.get con search", async () => {
    const mockResponse = { data: [{ id: 1, name: "Centro", city: "Ciudad", type: "" }] };
    (api.get as any).mockResolvedValue(mockResponse);

    const result = await neighborhoodService.getNeighborhoodByText("Cent");

    expect(api.get).toHaveBeenCalledWith("/properties/neighborhood/search", {
      params: { search: "Cent" },
      withCredentials: true,
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("lanza error si api.get falla en getAllNeighborhoods", async () => {
    (api.get as any).mockRejectedValue(new Error("Network error"));
    await expect(neighborhoodService.getAllNeighborhoods()).rejects.toThrow("Network error");
  });

  it("lanza error si api.get falla en getNeighborhoodById", async () => {
    (api.get as any).mockRejectedValue(new Error("Fetch failed"));
    await expect(neighborhoodService.getNeighborhoodById(1)).rejects.toThrow("Fetch failed");
  });

  it("lanza error si api.post falla en postNeighborhood", async () => {
    const data: NeighborhoodCreate = {
      name: "Barrio Test",
      city: "Ciudad",
      type: NeighborhoodType.ABIERTO,
    };
    (api.post as any).mockRejectedValue(new Error("Post failed"));
    await expect(neighborhoodService.postNeighborhood(data)).rejects.toThrow("Post failed");
  });

  it("lanza error si api.put falla en putNeighborhood", async () => {
    const data: Neighborhood = {
      id: 1,
      name: "Barrio Test",
      city: "Ciudad",
      type: NeighborhoodType.CERRADO,
    };
    (api.put as any).mockRejectedValue(new Error("Put failed"));
    await expect(neighborhoodService.putNeighborhood(data)).rejects.toThrow("Put failed");
  });

  it("lanza error si api.delete falla en deleteNeighborhood", async () => {
    const data: Neighborhood = {
      id: 1,
      name: "Barrio Test",
      city: "Ciudad",
      type: NeighborhoodType.ABIERTO,
    };
    (api.delete as any).mockRejectedValue(new Error("Delete failed"));
    await expect(neighborhoodService.deleteNeighborhood(data)).rejects.toThrow("Delete failed");
  });

  it("getNeighborhoodByText devuelve array vacío si no hay resultados", async () => {
    (api.get as any).mockResolvedValue({ data: [] });
    const result = await neighborhoodService.getNeighborhoodByText("NoExiste");
    expect(result).toEqual([]);
    expect(api.get).toHaveBeenCalledWith("/properties/neighborhood/search", {
      params: { search: "NoExiste" },
      withCredentials: true,
    });
  });
});
