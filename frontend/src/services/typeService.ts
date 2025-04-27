import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
import { Type } from "../types/type";

export const getAllTypes = async () => {
  try {
    const response = await axios.get(`${apiUrl}/type/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching types:", error);
    throw error;
  }
};

export const getTypeById = async (id: number) => {
  try {
    const response = await axios.get(`${apiUrl}/type/getById/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching type with ID ${id}:`, error);
    throw error;
  }
};

export const postType = async (typeData: Type) => {
  try {
    const response = await axios.post(`${apiUrl}/type/create`, null, {
      params: {
        name: typeData.name,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating type:", error);
    throw error;
  }
};

export const putType = async (typeData: Type) => {
  try {
    const response = await axios.put(`${apiUrl}/type/update`, typeData);
    return response.data;
  } catch (error) {
    console.error("Error saving type:", error);
    throw error;
  }
};

export const deleteType = async (typeData: Type) => {
  try {
    const response = await axios.delete(`${apiUrl}/type/delete/${typeData.id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting type:", error);
    throw error;
  }
};
