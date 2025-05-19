import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
import { Maintenance, MaintenanceCreate } from "../types/maintenance";

export const getMaintenanceById = async (id: number) => {
  try {
    const response = await axios.get(
      `${apiUrl}/properties/maintenance/getById/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching maintenance with ID ${id}:`, error);
    throw error;
  }
};

export const getMaintenanceByPropertyId = async (id: number) => {
  try {
    const response = await axios.get(
      `${apiUrl}/properties/maintenance/getByPropertyId/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching maintenance with ID ${id}:`, error);
    throw error;
  }
};

export const postMaintenance = async (maintenanceData: MaintenanceCreate) => {
  try {
    const response = await axios.post(
      `${apiUrl}/properties/maintenance/create`,
      maintenanceData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating maintenance:", error);
    throw error;
  }
};

export const putMaintenance = async (maintenanceData: Maintenance) => {
  try {
    const response = await axios.put(
      `${apiUrl}/properties/maintenance/update/${maintenanceData.id}`,
      maintenanceData
    );
    return response.data;
  } catch (error) {
    console.error("Error saving maintenance:", error);
    throw error;
  }
};

export const deleteMaintenance = async (maintenanceData: Maintenance) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/properties/maintenance/delete/${maintenanceData.id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting maintenance:", error);
    throw error;
  }
};
