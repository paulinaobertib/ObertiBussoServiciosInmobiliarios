import { Type, TypeCreate } from "../types/type";
import { api } from "../../../api";

export const getAllTypes = async () => {
  try {
    const response = await api.get(`/properties/type/getAll`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching types:", error);
    throw error;
  }
};

export const getTypeById = async (id: number) => {
  try {
    const response = await api.get(`/properties/type/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching type with ID ${id}:`, error);
    throw error;
  }
};

export const postType = async (typeData: TypeCreate) => {
  try {
    const response = await api.post(`/properties/type/create`, typeData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true, // <— added
    });
    return response.data;
  } catch (error) {
    console.error("Error creating type:", error);
    throw error;
  }
};

export const putType = async (typeData: Type) => {
  try {
    const response = await api.put(`/properties/type/update`, typeData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving type:", error);
    throw error;
  }
};

export const deleteType = async (typeData: Type) => {
  try {
    const response = await api.delete(
      `/properties/type/delete/${typeData.id}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting type:", error);
    throw error;
  }
};
