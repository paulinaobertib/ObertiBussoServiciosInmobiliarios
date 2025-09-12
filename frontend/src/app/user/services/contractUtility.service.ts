import { api } from "../../../api";
import type {
  ContractUtility,
  ContractUtilityCreate,
  ContractUtilityGet,
  UtilityPeriodicityPayment,
} from "../types/contractUtility";

export const postContractUtility = async (data: ContractUtilityCreate) => {
  try {
    const response = await api.post(`/users/contractUtilities/create`, data, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error creating contract utility:", error);
    throw error;
  }
};

export const putContractUtility = async (data: ContractUtility) => {
  try {
    const response = await api.put(`/users/contractUtilities/update`, data, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error updating contract utility:", error);
    throw error;
  }
};

export const deleteContractUtility = async (id: number) => {
  try {
    const response = await api.delete(`/users/contractUtilities/delete/${id}`, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error deleting contract utility:", error);
    throw error;
  }
};

export const deleteContractUtilitiesByContract = async (contractId: number) => {
  try {
    const response = await api.delete(`/users/contractUtilities/deleteByContract/${contractId}`, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error(`Error deleting utilities for contract ${contractId}:`, error);
    throw error;
  }
};

export const getContractUtilityById = async (id: number) => {
  try {
    const response = await api.get(`/users/contractUtilities/getById/${id}`, {
      withCredentials: true,
    });
    return response.data as ContractUtilityGet;
  } catch (error) {
    console.error(`Error fetching contract utility with ID ${id}:`, error);
    throw error;
  }
};

export const getContractUtilitiesByContract = async (contractId: number) => {
  try {
    const response = await api.get(`/users/contractUtilities/getByContract/${contractId}`, { withCredentials: true });
    return response.data as ContractUtilityGet[];
  } catch (error) {
    console.error(`Error fetching contract utilities for contract ${contractId}:`, error);
    throw error;
  }
};

export const getContractUtilitiesByUtility = async (utilityId: number) => {
  try {
    const response = await api.get(`/users/contractUtilities/getByUtility/${utilityId}`, { withCredentials: true });
    return response.data as ContractUtilityGet[];
  } catch (error) {
    console.error(`Error fetching contract utilities for utility ${utilityId}:`, error);
    throw error;
  }
};

export const getContractUtilitiesByPeriodicity = async (periodicity: UtilityPeriodicityPayment) => {
  try {
    const response = await api.get(`/users/contractUtilities/getByPeriodicity/${periodicity}`, {
      withCredentials: true,
    });
    return response.data as ContractUtilityGet[];
  } catch (error) {
    console.error("Error fetching contract utilities by periodicity:", error);
    throw error;
  }
};
