// contract.service.ts
import {
  Contract,
  ContractCreate,
  ContractStatus,
  ContractType,
} from "../types/contract";
import { api } from "../../../api";

export const postContract = async (
  contractData: ContractCreate,
  amount: number,
  currency: string
) => {
  try {
    const response = await api.post(
      `users/contracts/create`, // ← ruta corregida
      contractData,
      {
        params: { amount, currency }, // arma ?amount=…&currency=…
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating contract:", error);
    throw error;
  }
};

export const putContract = async (contractData: Contract) => {
  try {
    const response = await api.put(`/users/contracts/update`, contractData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating contract:", error);
    throw error;
  }
};

export const patchContractStatus = async (id: number) => {
  try {
    const response = await api.patch(
      `/users/contracts/updateStatus/${id}`,
      null,
      { withCredentials: true }
    );
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
    const res = await api.get(
      `/users/contracts/getByUser/${encodeURIComponent(userId)}`,
      { withCredentials: true }
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch (e: any) {
    const status = e?.response?.status;
    const detail =
      e?.response?.data?.message ??
      e?.response?.data?.error ??
      e?.message ??
      "Unknown error";
    console.error("[contracts] getContractsByUserId failed", {
      status,
      detail,
      body: e?.response?.data,
    });
    throw new Error(`getByUser failed [${status ?? "?"}]: ${detail}`);
  }
};


export const getContractsByPropertyId = async (propertyId: number) => {
  try {
    const response = await api.get(`/users/contracts/property/${propertyId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching contracts for property ${propertyId}:`,
      error
    );
    throw error;
  }
};

export const getContractsByType = async (type: ContractType) => {
  try {
    const response = await api.get(`/users/contracts/type`, {
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
    const response = await api.get(`/users/contracts/status`, {
      params: { status },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contracts by status:", error);
    throw error;
  }
};

export const getContractsByDateRange = async (start: string, end: string) => {
  try {
    const response = await api.get(`/users/contracts/dateRange`, {
      params: { start, end },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contracts by date range:", error);
    throw error;
  }
};