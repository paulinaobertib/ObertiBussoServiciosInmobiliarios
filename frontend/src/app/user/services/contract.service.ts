import type { ContractCreate, ContractStatus, ContractType } from "../types/contract";
import { api } from "../../../api";

export const postContract = async (contractData: ContractCreate) => {
  try {
    const response = await api.post(`/users/contracts/create`, contractData, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error creating contract:", error);
    throw error;
  }
};

export const putContract = async (id: number, contractData: ContractCreate) => {
  try {
    // Log básico para verificar que SÍ se llama al PUT y con qué datos
    // (se mostrará una versión acotada para evitar logs gigantes)
    console.debug("[contract.service] PUT /users/contracts/update/%s payload:", id, {
      ...contractData,
    });

    const response = await api.put(`/users/contracts/update/${id}`, contractData, {
      withCredentials: true,
    });

    console.debug("[contract.service] PUT done. Status:", response.status);
    return response.data;
  } catch (error: any) {
    // Log más expresivo: status y data del backend si existen
    const status = error?.response?.status;
    const data = error?.response?.data;
    console.error("[contract.service] Error updating contract:", { status, data, error });
    throw error;
  }
};

export const patchContractStatus = async (id: number) => {
  try {
    const response = await api.patch(`/users/contracts/updateStatus/${id}`, null, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error updating contract status:", error);
    throw error;
  }
};

export const deleteContract = async (id: number) => {
  try {
    const response = await api.delete(`/users/contracts/delete/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting contract:", error);
    throw error;
  }
};

export const deleteContractsByProperty = async (propertyId: number) => {
  try {
    const response = await api.delete(`/users/contracts/deleteByProperty/${propertyId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error(`Error deleting contracts for property ${propertyId}:`, error);
    throw error;
  }
};

export const deleteContractsByUser = async (userId: string) => {
  try {
    const response = await api.delete(`/users/contracts/deleteByUser/${userId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error(`Error deleting contracts for user ${userId}:`, error);
    throw error;
  }
};

export const getContractById = async (id: number) => {
  try {
    const response = await api.get(`/users/contracts/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching contract with ID ${id}:`, error);
    throw error;
  }
};

export const getAllContracts = async () => {
  try {
    const response = await api.get(`/users/contracts/getAll`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all contracts:", error);
    throw error;
  }
};

export const getContractsByUserId = async (userId: string) => {
  try {
    const response = await api.get(`/users/contracts/getByUser/${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching contracts for user ${userId}:`, error);
    throw error;
  }
};

export const getContractsByPropertyId = async (propertyId: number) => {
  try {
    const response = await api.get(`/users/contracts/getByProperty/${propertyId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching contracts for property ${propertyId}:`, error);
    throw error;
  }
};

export const getContractsByType = async (type: ContractType) => {
  try {
    const response = await api.get(`/users/contracts/getByType`, {
      params: { type },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contracts by type:", error);
    throw error;
  }
};

export const getContractsByStatus = async (status: ContractStatus) => {
  try {
    const response = await api.get(`/users/contracts/getByStatus`, {
      params: { status },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contracts by status:", error);
    throw error;
  }
};

export const getContractsByDate = async (date: string) => {
  try {
    const response = await api.get(`/users/contracts/getByDate`, {
      params: { date },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contracts by date:", error);
    throw error;
  }
};

export const getContractsByDateRange = async (from: string, to: string) => {
  try {
    const response = await api.get(`/users/contracts/getByDateRange`, {
      params: { from, to },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contracts by date range:", error);
    throw error;
  }
};

export const getActiveContracts = async () => {
  try {
    const response = await api.get(`/users/contracts/active`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching active contracts:", error);
    throw error;
  }
};

export const getContractsExpiringWithin = async (days: number) => {
  try {
    const response = await api.get(`/users/contracts/expiringWithinDays`, {
      params: { days },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching expiring contracts:", error);
    throw error;
  }
};

export const getContractsEndingOn = async (date: string) => {
  try {
    const response = await api.get(`/users/contracts/endingOn`, {
      params: { date },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching ending-on contracts:", error);
    throw error;
  }
};

export const getContractsEndingBetween = async (from: string, to: string) => {
  try {
    const response = await api.get(`/users/contracts/endingBetween`, {
      params: { from, to },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contracts ending between dates:", error);
    throw error;
  }
};
