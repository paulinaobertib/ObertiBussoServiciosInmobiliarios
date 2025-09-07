import { api } from "../../../api";
import type { GuarantorCreate, Guarantor } from "../types/guarantor";

export const postGuarantor = async (data: GuarantorCreate) => {
  try {
    const response = await api.post(`/users/guarantors/create`, data, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error creating guarantor:", error);
    throw error;
  }
};

export const putGuarantor = async (id: number, data: GuarantorCreate) => {
  try {
    const response = await api.put(`/users/guarantors/update/${id}`, data, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error updating guarantor:", error);
    throw error;
  }
};

export const deleteGuarantor = async (id: number) => {
  try {
    const response = await api.delete(`/users/guarantors/delete/${id}`, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error deleting guarantor:", error);
    throw error;
  }
};

export const getGuarantorById = async (id: number) => {
  try {
    const response = await api.get(`/users/guarantors/getById/${id}`, {
      withCredentials: true,
    });
    return response.data as Guarantor;
  } catch (error) {
    console.error(`Error fetching guarantor with ID ${id}:`, error);
    throw error;
  }
};

export const getAllGuarantors = async () => {
  try {
    const response = await api.get(`/users/guarantors/getAll`, {
      withCredentials: true,
    });
    return response.data as Guarantor[];
  } catch (error) {
    console.error("Error fetching guarantors:", error);
    throw error;
  }
};

export const getGuarantorsByContract = async (contractId: number) => {
  try {
    const response = await api.get(`/users/guarantors/getByContract/${contractId}`, {
      withCredentials: true,
    });
    return response.data as Guarantor[];
  } catch (error) {
    console.error(`Error fetching guarantors for contract ${contractId}:`, error);
    throw error;
  }
};

export const getContractsByGuarantor = async (guarantorId: number): Promise<Guarantor[]> => {
  try {
    const response = await api.get(`/users/guarantors/getContracts/${guarantorId}`, { withCredentials: true });
    return response.data as Guarantor[];
  } catch (error) {
    console.error(`Error fetching contracts for guarantor ${guarantorId}:`, error);
    throw error;
  }
};

export const getGuarantorByEmail = async (email: string) => {
  try {
    const response = await api.get(`/users/guarantors/getByEmail`, {
      params: { email },
      withCredentials: true,
    });
    return response.data as Guarantor;
  } catch (error) {
    console.error("Error fetching guarantor by email:", error);
    throw error;
  }
};

export const getGuarantorByPhone = async (phone: string) => {
  try {
    const response = await api.get(`/users/guarantors/getByPhone`, {
      params: { phone },
      withCredentials: true,
    });
    return response.data as Guarantor;
  } catch (error) {
    console.error("Error fetching guarantor by phone:", error);
    throw error;
  }
};

export const searchGuarantors = async (query: string) => {
  try {
    const response = await api.get(`/users/guarantors/search`, {
      params: { q: query },
      withCredentials: true,
    });
    return response.data as Guarantor[];
  } catch (error) {
    console.error("Error searching guarantors:", error);
    throw error;
  }
};

export const addGuarantorToContract = async (guarantorId: number, contractId: number) => {
  try {
    const response = await api.post(`/users/guarantors/addContracts/${guarantorId}/${contractId}`, null, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error linking guarantor to contract:", error);
    throw error;
  }
};

export const removeGuarantorFromContract = async (guarantorId: number, contractId: number) => {
  try {
    const response = await api.delete(`/users/guarantors/removeContracts/${guarantorId}/${contractId}`, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error unlinking guarantor from contract:", error);
    throw error;
  }
};
