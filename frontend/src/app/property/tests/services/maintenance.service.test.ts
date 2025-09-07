import { vi, describe, it, expect, beforeEach } from "vitest";
import * as maintenanceService from "../../services/maintenance.service";
import { api } from "../../../../api";
import type { Maintenance, MaintenanceCreate } from "../../types/maintenance";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("maintenanceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMaintenanceById llama a api.get y devuelve los datos", async () => {
    const mockResponse = { data: { id: 1, description: "Test maintenance" } };
    (api.get as any).mockResolvedValue(mockResponse);

    const result = await maintenanceService.getMaintenanceById(1);

    expect(api.get).toHaveBeenCalledWith(
      "/properties/maintenance/getById/1",
      { withCredentials: true }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("getMaintenancesByPropertyId llama a api.get y devuelve los datos", async () => {
    const mockResponse = { data: [{ id: 1 }, { id: 2 }] };
    (api.get as any).mockResolvedValue(mockResponse);

    const result = await maintenanceService.getMaintenancesByPropertyId(5);

    expect(api.get).toHaveBeenCalledWith(
      "/properties/maintenance/getByPropertyId/5",
      { withCredentials: true }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("postMaintenance llama a api.post con MaintenanceCreate y devuelve los datos", async () => {
    const data: MaintenanceCreate = {
        title: "Mantenimiento de prueba",
        description: "Revisión de instalaciones",
        date: "2025-08-21",
        propertyId: 1,
        };
    const mockResponse = { data: { id: 1, ...data } };
    (api.post as any).mockResolvedValue(mockResponse);

    const result = await maintenanceService.postMaintenance(data);

    expect(api.post).toHaveBeenCalledWith(
      "/properties/maintenance/create",
      data,
      { headers: { "Content-Type": "application/json" }, withCredentials: true }
    );
    expect(result).toEqual(mockResponse.data);
  });

    it("putMaintenance llama a api.put con Maintenance y devuelve los datos", async () => {
    const data: Maintenance = {
        id: 1,
        title: "Mantención calefacción",
        description: "Mantención actualizada",
        date: "2025-08-21",
        propertyId: 1,
    };
    const mockResponse = { data };
    (api.put as any).mockResolvedValue(mockResponse);

    const result = await maintenanceService.putMaintenance(data);

    expect(api.put).toHaveBeenCalledWith(
        "/properties/maintenance/update/1",
        data,
        { withCredentials: true }
    );
    expect(result).toEqual(mockResponse.data);
    });

    it("deleteMaintenance llama a api.delete con Maintenance y devuelve los datos", async () => {
    const data: Maintenance = {
        id: 1,
        title: "Mantención calefacción",
        description: "Mantención a borrar",
        date: "2025-08-21",
        propertyId: 1,
    };
    const mockResponse = { data: { success: true } };
    (api.delete as any).mockResolvedValue(mockResponse);

    const result = await maintenanceService.deleteMaintenance(data);

    expect(api.delete).toHaveBeenCalledWith(
        "/properties/maintenance/delete/1",
        { withCredentials: true }
    );
    expect(result).toEqual(mockResponse.data);
    });

  it("lanza error si la API falla", async () => {
    (api.get as any).mockRejectedValue(new Error("Network error"));

    await expect(maintenanceService.getMaintenanceById(1)).rejects.toThrow("Network error");
  });
});
