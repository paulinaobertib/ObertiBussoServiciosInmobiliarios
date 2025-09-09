import { api } from "../../../api"; 

export const getUtilityById = async (id: number) => {
  try {
    const response = await api.get(`/users/utilities/getById/${id}`, {
      withCredentials: true,
    });
    return response.data; 
  } catch (error) {
    console.error(`Error fetching utility with ID ${id}:`, error);
    throw error;
  }
};
