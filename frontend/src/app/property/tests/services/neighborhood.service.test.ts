import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  getAllNeighborhoods,
  getNeighborhoodById,
  postNeighborhood,
  putNeighborhood,
  deleteNeighborhood,
} from "../../services/neighborhood.service";
import {
  Neighborhood,
  NeighborhoodCreate,
  NeighborhoodType,
} from "../../types/neighborhood";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const apiUrl = import.meta.env.VITE_API_URL;

const mockNeighborhoodCreate: NeighborhoodCreate = {
  name: "Palermo",
  city: "Buenos Aires",
  type: NeighborhoodType.ABIERTO,
};

const mockNeighborhood: Neighborhood = {
  id: 1,
  ...mockNeighborhoodCreate,
};

describe("neighborhood.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // POST - éxito
  it("crea un barrio con datos válidos", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 1 } });

    const result = await postNeighborhood(mockNeighborhoodCreate);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiUrl}/properties/neighborhood/create`,
      mockNeighborhoodCreate
    );
    expect(result).toEqual({ id: 1 });
  });

  // POST - error
  it("lanza error al crear un barrio", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Error de red"));

    await expect(postNeighborhood(mockNeighborhoodCreate)).rejects.toThrow(
      "Error de red"
    );
  });

  // PUT - éxito
  it("actualiza un barrio con datos válidos", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } });

    const result = await putNeighborhood(mockNeighborhood);

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${apiUrl}/properties/neighborhood/update/1`,
      mockNeighborhood,
      expect.any(Object)
    );
    expect(result).toEqual({ success: true });
  });

  // PUT - error
  it("lanza error al actualizar un barrio", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Error de red"));

    await expect(putNeighborhood(mockNeighborhood)).rejects.toThrow(
      "Error de red"
    );
  });

  // DELETE - éxito
  it("elimina un barrio existente", async () => {
    mockedAxios.delete.mockResolvedValue({ data: "deleted" });

    const result = await deleteNeighborhood(mockNeighborhood);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${apiUrl}/properties/neighborhood/delete/1`
    );
    expect(result).toBe("deleted");
  });

  // DELETE - error
  it("lanza error al eliminar un barrio", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Error de red"));

    await expect(deleteNeighborhood(mockNeighborhood)).rejects.toThrow(
      "Error de red"
    );
  });

  // GET ALL - éxito
  it("obtiene todos los barrios", async () => {
    mockedAxios.get.mockResolvedValue({ data: [mockNeighborhood] });

    const result = await getAllNeighborhoods();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/neighborhood/getAll`
    );
    expect(result).toEqual([mockNeighborhood]);
  });

  // GET ALL - error
  it("lanza error al obtener todos los barrios", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    await expect(getAllNeighborhoods()).rejects.toThrow("Error de red");
  });

  // GET BY ID - éxito
  it("obtiene un barrio por ID", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockNeighborhood });

    const result = await getNeighborhoodById(1);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/neighborhood/getById/1`
    );
    expect(result).toEqual(mockNeighborhood);
  });

  // GET BY ID - error
  it("lanza error al obtener barrio por ID", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    await expect(getNeighborhoodById(1)).rejects.toThrow("Error de red");
  });
});
