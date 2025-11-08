import { Maintenance, MaintenanceCreate } from "../types/maintenance";
import { api } from "../../../api";

export const getMaintenanceById = async (id: number) => {
  try {
    const response = await api.get(`/properties/maintenance/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching maintenance with ID ${id}:`, error);
    throw error;
  }
};

export const getMaintenancesByPropertyId = async (id: number) => {
  try {
    const response = await api.get(`/properties/maintenance/getByPropertyId/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error(`Error fetching maintenance for property ID ${id}:`, error);
    throw error;
  }
};

export const postMaintenance = async (maintenanceData: MaintenanceCreate) => {
  try {
    const response = await api.post(`/properties/maintenance/create`, maintenanceData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating maintenance:", error);
    throw error;
  }
};

export const putMaintenance = async (maintenanceData: Maintenance) => {
  try {
    const response = await api.put(`/properties/maintenance/update/${maintenanceData.id}`, maintenanceData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving maintenance:", error);
    throw error;
  }
};

export const deleteMaintenance = async (maintenanceData: Maintenance) => {
  try {
    const response = await api.delete(`/properties/maintenance/delete/${maintenanceData.id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting maintenance:", error);
    throw error;
  }
};
