import { api } from "../../../api";
import type { IncreaseIndex, IncreaseIndexCreate } from "../types/increaseIndex";
import type { ContractSimple } from "../types/contract";

export const postIncreaseIndex = async (data: IncreaseIndexCreate) => {
  try {
    const response = await api.post(`/users/increaseIndex/create`, data, {
      withCredentials: true,
    });
    // console.log(response);
    return response.data as string;
  } catch (error) {
    console.error("Error creating increase index:", error);
    throw error;
  }
};

export const putIncreaseIndex = async (data: IncreaseIndex) => {
  try {
    const response = await api.put(`/users/increaseIndex/update`, data, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error updating increase index:", error);
    throw error;
  }
};

export const deleteIncreaseIndex = async (id: number) => {
  try {
    const response = await api.delete(`/users/increaseIndex/delete/${id}`, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error deleting increase index:", error);
    throw error;
  }
};

export const getIncreaseIndexById = async (id: number) => {
  try {
    const response = await api.get(`/users/increaseIndex/getById/${id}`, {
      withCredentials: true,
    });
    return response.data as IncreaseIndex;
  } catch (error) {
    console.error(`Error fetching increase index with ID ${id}:`, error);
    throw error;
  }
};

export const getAllIncreaseIndexes = async () => {
  try {
    const response = await api.get(`/users/increaseIndex/getAll`, {
      withCredentials: true,
    });
    return response.data as IncreaseIndex[];
  } catch (error) {
    console.error("Error fetching increase indexes:", error);
    throw error;
  }
};

export const getIncreaseIndexByName = async (name: string) => {
  try {
    const response = await api.get(`/users/increaseIndex/getByName`, {
      params: { name },
      withCredentials: true,
    });
    return response.data as IncreaseIndex;
  } catch (error) {
    console.error("Error fetching increase index by name:", error);
    throw error;
  }
};

export const getIncreaseIndexByCode = async (code: string) => {
  try {
    const response = await api.get(`/users/increaseIndex/getByCode`, {
      params: { code },
      withCredentials: true,
    });
    return response.data as IncreaseIndex;
  } catch (error) {
    console.error("Error fetching increase index by code:", error);
    throw error;
  }
};

export const getContractsByIncreaseIndex = async (id: number) => {
  try {
    const response = await api.get(`/users/increaseIndex/contracts/${id}`, {
      withCredentials: true,
    });
    return response.data as ContractSimple[];
  } catch (error) {
    console.error("Error fetching contracts by increase index:", error);
    throw error;
  }
};

export const getIncreaseIndexByContract = async (contractId: number) => {
  try {
    const response = await api.get(`/users/increaseIndex/getByContract/${contractId}`, { withCredentials: true });
    return response.data as IncreaseIndex;
  } catch (error) {
    console.error(`Error fetching increase index for contract ${contractId}:`, error);
    throw error;
  }
};
