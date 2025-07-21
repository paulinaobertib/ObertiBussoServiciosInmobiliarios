import {
  ContractIncrease,
  ContractIncreaseCreate,
} from "../types/contractIncrease";
import { api } from "../../../api";

export const postContractIncrease = async (data: ContractIncreaseCreate) => {
  try {
    const response = await api.post(`/users/contractIncreases/create`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating contract increase:", error);
    throw error;
  }
};

export const deleteContractIncrease = async (data: ContractIncrease) => {
  try {
    const response = await api.delete(
      `/users/contractIncreases/delete/${data.id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting contract increase:", error);
    throw error;
  }
};

export const getContractIncreaseById = async (id: number) => {
  try {
    const response = await api.get(`/users/contractIncreases/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching contract increase with ID ${id}:`, error);
    throw error;
  }
};

export const getContractIncreasesByContract = async (contractId: number) => {
  try {
    const response = await api.get(
      `/users/contractIncreases/contract/${contractId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching increases for contract ${contractId}:`,
      error
    );
    throw error;
  }
};
