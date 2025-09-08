import { api } from "../../../api";
import type { Utility } from "../types/utility";
import type { ContractSimple } from "../types/contract";

export const postUtility = async (data: Utility) => {
  try {
    const response = await api.post(`/users/utilities/create`, data, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error creating utility:", error);
    throw error;
  }
};

export const putUtility = async (data: Utility) => {
  try {
    const response = await api.put(`/users/utilities/update`, data, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error updating utility:", error);
    throw error;
  }
};

export const deleteUtility = async (id: number) => {
  try {
    const response = await api.delete(`/users/utilities/delete/${id}`, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error deleting utility:", error);
    throw error;
  }
};

export const getUtilityById = async (id: number) => {
  try {
    const response = await api.get(`/users/utilities/getById/${id}`, {
      withCredentials: true,
    });
    return response.data as Utility;
  } catch (error) {
    console.error(`Error fetching utility with ID ${id}:`, error);
    throw error;
  }
};

export const getAllUtilities = async () => {
  try {
    const response = await api.get(`/users/utilities/getAll`, {
      withCredentials: true,
    });
    return response.data as Utility[];
  } catch (error) {
    console.error("Error fetching utilities:", error);
    throw error;
  }
};

export const getUtilityByName = async (name: string) => {
  try {
    const response = await api.get(`/users/utilities/getByName`, {
      params: { name },
      withCredentials: true,
    });
    return response.data as Utility;
  } catch (error) {
    console.error("Error fetching utility by name:", error);
    throw error;
  }
};

export const getContractsByUtility = async (id: number) => {
  try {
    const response = await api.get(`/users/utilities/contracts/${id}`, {
      withCredentials: true,
    });
    return response.data as ContractSimple[];
  } catch (error) {
    console.error("Error fetching contracts by utility:", error);
    throw error;
  }
};

export const getUtilitiesByContract = async (contractId: number) => {
  try {
    const response = await api.get(`/users/utilities/getByContract/${contractId}`, {
      withCredentials: true,
    });
    return response.data as Utility[];
  } catch (error) {
    console.error(`Error fetching utilities for contract ${contractId}:`, error);
    throw error;
  }
};
