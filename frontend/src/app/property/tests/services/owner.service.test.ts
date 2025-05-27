import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  postOwner,
  putOwner,
  deleteOwner,
  getAllOwners,
  getOwnerById,
  getOwnerByPropertyId,
} from "../../services/owner.service";
import { Owner, OwnerCreate } from "../../types/owner";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const apiUrl = import.meta.env.VITE_API_URL;

const sampleOwnerCreate: OwnerCreate = {
  firstName: "Juan",
  lastName: "Pérez",
  mail: "juan.perez@example.com",
  phone: "123456789",
};

const sampleOwner: Owner = {
  id: 1,
  firstName: "María",
  lastName: "Gómez",
  mail: "maria.gomez@example.com",
  phone: "987654321",
};

describe("owner.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // POST success
  it("crea un propietario con datos válidos", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 2, ...sampleOwnerCreate } });

    const result = await postOwner(sampleOwnerCreate);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiUrl}/properties/owner/create`,
      sampleOwnerCreate
    );
    expect(result).toEqual({ id: 2, ...sampleOwnerCreate });
  });

  // POST error
  it("lanza error al crear un propietario", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Error de red"));

    await expect(postOwner(sampleOwnerCreate)).rejects.toThrow("Error de red");
  });

  // PUT success
  it("actualiza un propietario existente", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } });

    const result = await putOwner(sampleOwner);

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${apiUrl}/properties/owner/update`,
      sampleOwner
    );
    expect(result).toEqual({ success: true });
  });

  // PUT error
  it("lanza error al actualizar un propietario", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Error de red"));

    await expect(putOwner(sampleOwner)).rejects.toThrow("Error de red");
  });

  // DELETE success
  it("elimina un propietario", async () => {
    mockedAxios.delete.mockResolvedValue({ data: "deleted" });

    const result = await deleteOwner(sampleOwner);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${apiUrl}/properties/owner/delete/1`
    );
    expect(result).toBe("deleted");
  });

  // DELETE error
  it("lanza error al eliminar un propietario", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Error de red"));

    await expect(deleteOwner(sampleOwner)).rejects.toThrow("Error de red");
  });

  // GET ALL success
  it("obtiene todos los propietarios", async () => {
    mockedAxios.get.mockResolvedValue({ data: [sampleOwner] });

    const result = await getAllOwners();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/owner/getAll`
    );
    expect(result).toEqual([sampleOwner]);
  });

  // GET ALL error
  it("lanza error al obtener todos los propietarios", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    await expect(getAllOwners()).rejects.toThrow("Error de red");
  });

  // GET BY ID success
  it("obtiene un propietario por id", async () => {
    mockedAxios.get.mockResolvedValue({ data: sampleOwner });

    const result = await getOwnerById(1);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/owner/getById/1`
    );
    expect(result).toEqual(sampleOwner);
  });

  // GET BY ID error
  it("lanza error al obtener propietario por id", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    await expect(getOwnerById(1)).rejects.toThrow("Error de red");
  });

  // GET BY PROPERTY ID success
  it("obtiene un propietario por id de propiedad", async () => {
    mockedAxios.get.mockResolvedValue({ data: sampleOwner });

    const result = await getOwnerByPropertyId(1);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/owner/getByProperty/1`
    );
    expect(result).toEqual(sampleOwner);
  });

  // GET BY PROPERTY ID error
  it("lanza error al obtener propietario por id de propiedad", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    await expect(getOwnerByPropertyId(1)).rejects.toThrow("Error de red");
  });
});
