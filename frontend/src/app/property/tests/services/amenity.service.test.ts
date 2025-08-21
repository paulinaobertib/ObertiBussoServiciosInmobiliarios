import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "../../../../api";
import {
  getAllAmenities,
  getAmenityById,
  postAmenity,
  putAmenity,
  deleteAmenity,
  getAmenitiesByText,
} from "../../services/amenity.service";
import { Amenity, AmenityCreate } from "../../types/amenity";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("amenity.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllAmenities llama a api.get y devuelve data", async () => {
    (api.get as any).mockResolvedValue({ data: [{ id: 1, name: "Piscina" }] });

    const result = await getAllAmenities();
    expect(api.get).toHaveBeenCalledWith("/properties/amenity/getAll", {
      withCredentials: true,
    });
    expect(result).toEqual([{ id: 1, name: "Piscina" }]);
  });

  it("getAmenityById llama a api.get con el id", async () => {
    (api.get as any).mockResolvedValue({ data: { id: 5, name: "Parrilla" } });

    const result = await getAmenityById(5);
    expect(api.get).toHaveBeenCalledWith("/properties/amenity/getById/5", {
      withCredentials: true,
    });
    expect(result).toEqual({ id: 5, name: "Parrilla" });
  });

  it("postAmenity llama a api.post con params", async () => {
    const amenity: AmenityCreate = { name: "Garage" };
    (api.post as any).mockResolvedValue({ data: { id: 2, ...amenity } });

    const result = await postAmenity(amenity);
    expect(api.post).toHaveBeenCalledWith(
      "/properties/amenity/create",
      null,
      { params: { name: "Garage" }, withCredentials: true }
    );
    expect(result).toEqual({ id: 2, name: "Garage" });
  });

  it("putAmenity llama a api.put con amenityData", async () => {
    const amenity: Amenity = { id: 3, name: "Wifi" };
    (api.put as any).mockResolvedValue({ data: amenity });

    const result = await putAmenity(amenity);
    expect(api.put).toHaveBeenCalledWith(
      "/properties/amenity/update",
      amenity,
      { withCredentials: true }
    );
    expect(result).toEqual(amenity);
  });

  it("deleteAmenity llama a api.delete con el id", async () => {
    const amenity: Amenity = { id: 10, name: "Ascensor" };
    (api.delete as any).mockResolvedValue({ data: "deleted" });

    const result = await deleteAmenity(amenity);
    expect(api.delete).toHaveBeenCalledWith(
      "/properties/amenity/delete/10",
      { withCredentials: true }
    );
    expect(result).toBe("deleted");
  });

  it("getAmenitiesByText llama a api.get con search param", async () => {
    (api.get as any).mockResolvedValue({ data: [{ id: 7, name: "Sauna" }] });

    const result = await getAmenitiesByText("sau");
    expect(api.get).toHaveBeenCalledWith("/properties/amenity/search", {
      params: { search: "sau" },
      withCredentials: true,
    });
    expect(result).toEqual([{ id: 7, name: "Sauna" }]);
  });

  it("lanza error si api.get falla en getAllAmenities", async () => {
    (api.get as any).mockRejectedValue(new Error("network error"));
    await expect(getAllAmenities()).rejects.toThrow("network error");
  });

  it("lanza error si api.get falla en getAmenityById", async () => {
    (api.get as any).mockRejectedValue(new Error("fetch failed"));
    await expect(getAmenityById(1)).rejects.toThrow("fetch failed");
  });

  it("lanza error si api.post falla en postAmenity", async () => {
    const amenity: AmenityCreate = { name: "Test" };
    (api.post as any).mockRejectedValue(new Error("post failed"));
    await expect(postAmenity(amenity)).rejects.toThrow("post failed");
  });

  it("lanza error si api.put falla en putAmenity", async () => {
    const amenity: Amenity = { id: 1, name: "Test" };
    (api.put as any).mockRejectedValue(new Error("put failed"));
    await expect(putAmenity(amenity)).rejects.toThrow("put failed");
  });

  it("lanza error si api.delete falla en deleteAmenity", async () => {
    const amenity: Amenity = { id: 1, name: "Test" };
    (api.delete as any).mockRejectedValue(new Error("delete failed"));
    await expect(deleteAmenity(amenity)).rejects.toThrow("delete failed");
  });

  it("lanza error si api.get falla en getAmenitiesByText", async () => {
    (api.get as any).mockRejectedValue(new Error("search failed"));
    await expect(getAmenitiesByText("test")).rejects.toThrow("search failed");
  });

  it("postAmenity con nombre vacío", async () => {
    const amenity: AmenityCreate = { name: "" };
    (api.post as any).mockResolvedValue({ data: { id: 5, name: "" } });

    const result = await postAmenity(amenity);
    expect(result).toEqual({ id: 5, name: "" });
  });

  it("deleteAmenity con id inexistente", async () => {
    const amenity: Amenity = { id: 999, name: "NoExiste" };
    (api.delete as any).mockResolvedValue({ data: null });

    const result = await deleteAmenity(amenity);
    expect(result).toBeNull();
  });
});
