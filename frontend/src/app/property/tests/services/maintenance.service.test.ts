import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  getMaintenanceById,
  getMaintenanceByPropertyId,
  postMaintenance,
  putMaintenance,
  deleteMaintenance,
} from "../../../property/services/maintenance.service";
import { Maintenance, MaintenanceCreate } from "../../../property/types/maintenance";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

describe("maintenance.service", () => {
  const mockMaintenance: Maintenance = {
    id: 1,
    title: "Cambio de cañerías",
    description: "Reemplazo completo de cañerías del baño",
    date: "2024-12-01",
    propertyId: 3,
  };

  const mockMaintenanceCreate: MaintenanceCreate = {
    title: "Pintura exterior",
    description: "Pintura de la fachada del edificio",
    date: "2025-01-15",
    propertyId: 5,
  };

  const apiUrl = import.meta.env.VITE_API_URL;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("obtiene mantenimiento por ID", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockMaintenance });
    const result = await getMaintenanceById(1);
    expect(result).toEqual(mockMaintenance);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/maintenance/getById/1`
    );
  });

  it("maneja error al obtener mantenimiento por ID", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error"));
    await expect(getMaintenanceById(1)).rejects.toThrow("Error");
  });

  it("obtiene mantenimiento por ID de propiedad", async () => {
    mockedAxios.get.mockResolvedValue({ data: [mockMaintenance] });
    const result = await getMaintenanceByPropertyId(3);
    expect(result).toEqual([mockMaintenance]);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/maintenance/getByPropertyId/3`
    );
  });

  it("maneja error al obtener mantenimiento por ID de propiedad", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error"));
    await expect(getMaintenanceByPropertyId(3)).rejects.toThrow("Error");
  });

  it("crea un mantenimiento", async () => {
    mockedAxios.post.mockResolvedValue({ data: mockMaintenance });
    const result = await postMaintenance(mockMaintenanceCreate);
    expect(result).toEqual(mockMaintenance);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiUrl}/properties/maintenance/create`,
      mockMaintenanceCreate,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  });

  it("maneja error al crear mantenimiento", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Error"));
    await expect(postMaintenance(mockMaintenanceCreate)).rejects.toThrow("Error");
  });

  it("actualiza un mantenimiento", async () => {
    mockedAxios.put.mockResolvedValue({ data: mockMaintenance });
    const result = await putMaintenance(mockMaintenance);
    expect(result).toEqual(mockMaintenance);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${apiUrl}/properties/maintenance/update/1`,
      mockMaintenance
    );
  });

  it("maneja error al actualizar mantenimiento", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Error"));
    await expect(putMaintenance(mockMaintenance)).rejects.toThrow("Error");
  });

  it("elimina un mantenimiento", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
    const result = await deleteMaintenance(mockMaintenance);
    expect(result).toEqual({ success: true });
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${apiUrl}/properties/maintenance/delete/1`
    );
  });

  it("maneja error al eliminar mantenimiento", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Error"));
    await expect(deleteMaintenance(mockMaintenance)).rejects.toThrow("Error");
  });
});
