import { Owner, OwnerCreate } from "../types/owner";
import { api } from "../../../api";

export const postOwner = async (ownerData: OwnerCreate) => {
  try {
    const response = await api.post(`/properties/owner/create`, ownerData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating owner:", error);
    throw error;
  }
};

export const putOwner = async (ownerData: Owner) => {
  try {
    const response = await api.put(`/properties/owner/update`, ownerData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving owner:", error);
    throw error;
  }
};

export const deleteOwner = async (ownerData: Owner) => {
  try {
    const response = await api.delete(
      `/properties/owner/delete/${ownerData.id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting owner:", error);
    throw error;
  }
};

export const getAllOwners = async () => {
  try {
    const response = await api.get(`/properties/owner/getAll`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching owners:", error);
    throw error;
  }
};

export const getOwnerById = async (id: number) => {
  try {
    const response = await api.get(`/properties/owner/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching owner with ID ${id}:`, error);
    throw error;
  }
};

export const getOwnerByPropertyId = async (id: number) => {
  try {
    const response = await api.get(`/properties/owner/getByProperty/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching owner with ID ${id}:`, error);
    throw error;
  }
};

export const getOwnersByText = async (search: string) => {
  try {
    const { data } = await api.get<Owner[]>(`/properties/owner/search`, {
      params: { search },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error searching by text:", error);
    throw error;
  }
};
