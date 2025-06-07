import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  getAllTypes,
  getTypeById,
  postType,
  putType,
  deleteType,
} from "../../services/type.service";
import { Type, TypeCreate } from "../../types/type";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const apiUrl = import.meta.env.VITE_API_URL;

const sampleTypeCreate: TypeCreate = {
  name: "Departamento",
  hasBedrooms: true,
  hasBathrooms: true,
  hasRooms: false,
  hasCoveredArea: false,
};

const sampleType: Type = {
  id: 1,
  name: "Casa",
  hasBedrooms: true,
  hasBathrooms: true,
  hasRooms: true,
  hasCoveredArea: true,
};

describe("type.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("obtiene todos los tipos", async () => {
    mockedAxios.get.mockResolvedValue({ data: [sampleType] });

    const result = await getAllTypes();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/type/getAll`
    );
    expect(result).toEqual([sampleType]);
  });

  it("lanza error al obtener todos los tipos", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    await expect(getAllTypes()).rejects.toThrow("Error de red");
  });

  it("obtiene un tipo por id", async () => {
    mockedAxios.get.mockResolvedValue({ data: sampleType });

    const result = await getTypeById(1);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/type/getById/1`
    );
    expect(result).toEqual(sampleType);
  });

  it("lanza error al obtener tipo por id", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    await expect(getTypeById(1)).rejects.toThrow("Error de red");
  });

  it("crea un tipo con datos válidos", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 2, ...sampleTypeCreate } });

    const result = await postType(sampleTypeCreate);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiUrl}/properties/type/create`,
      sampleTypeCreate,
      { headers: { "Content-Type": "application/json" } }
    );
    expect(result).toEqual({ id: 2, ...sampleTypeCreate });
  });

  it("lanza error al crear un tipo", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Error de red"));

    await expect(postType(sampleTypeCreate)).rejects.toThrow("Error de red");
  });

  it("actualiza un tipo existente", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } });

    const result = await putType(sampleType);

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${apiUrl}/properties/type/update`,
      sampleType
    );
    expect(result).toEqual({ success: true });
  });

  it("lanza error al actualizar un tipo", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Error de red"));

    await expect(putType(sampleType)).rejects.toThrow("Error de red");
  });

  it("elimina un tipo por id", async () => {
    mockedAxios.delete.mockResolvedValue({ data: "deleted" });

    const result = await deleteType(sampleType);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${apiUrl}/properties/type/delete/1`
    );
    expect(result).toBe("deleted");
  });

  it("lanza error al eliminar un tipo", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Error de red"));

    await expect(deleteType(sampleType)).rejects.toThrow("Error de red");
  });
});
