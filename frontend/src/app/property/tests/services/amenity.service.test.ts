import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  getAllAmenities,
  getAmenityById,
  postAmenity,
  putAmenity,
  deleteAmenity,
} from "../../../property/services/amenity.service";
import { Amenity, AmenityCreate } from "../../../property/types/amenity";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

describe("amenity.service", () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const mockAmenity: Amenity = {
    id: 1,
    name: "Pileta",
  };

  const mockAmenityCreate: AmenityCreate = {
    name: "Quincho",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("obtiene todas las amenities", async () => {
    mockedAxios.get.mockResolvedValue({ data: [mockAmenity] });

    const result = await getAllAmenities();
    expect(result).toEqual([mockAmenity]);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/amenity/getAll`
    );
  });

  it("maneja error al obtener todas las amenities", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error"));
    await expect(getAllAmenities()).rejects.toThrow("Error");
  });

  it("obtiene amenity por ID", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockAmenity });

    const result = await getAmenityById(1);
    expect(result).toEqual(mockAmenity);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/amenity/getById/1`
    );
  });

  it("maneja error al obtener amenity por ID", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error"));
    await expect(getAmenityById(1)).rejects.toThrow("Error");
  });

  it("crea una amenity", async () => {
    mockedAxios.post.mockResolvedValue({ data: mockAmenity });

    const result = await postAmenity(mockAmenityCreate);
    expect(result).toEqual(mockAmenity);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiUrl}/properties/amenity/create`,
      null,
      {
        params: { name: mockAmenityCreate.name },
      }
    );
  });

  it("maneja error al crear amenity", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Error"));
    await expect(postAmenity(mockAmenityCreate)).rejects.toThrow("Error");
  });

  it("actualiza una amenity", async () => {
    mockedAxios.put.mockResolvedValue({ data: mockAmenity });

    const result = await putAmenity(mockAmenity);
    expect(result).toEqual(mockAmenity);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${apiUrl}/properties/amenity/update`,
      mockAmenity
    );
  });

  it("maneja error al actualizar amenity", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Error"));
    await expect(putAmenity(mockAmenity)).rejects.toThrow("Error");
  });

  it("elimina una amenity", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });

    const result = await deleteAmenity(mockAmenity);
    expect(result).toEqual({ success: true });
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${apiUrl}/properties/amenity/delete/${mockAmenity.id}`
    );
  });

  it("maneja error al eliminar amenity", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Error"));
    await expect(deleteAmenity(mockAmenity)).rejects.toThrow("Error");
  });
});
