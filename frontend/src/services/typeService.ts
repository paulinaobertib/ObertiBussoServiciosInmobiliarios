import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export const getAllPropertyTypes = async () => {
  try {
    const response = await axios.get(`${apiUrl}/type/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching property types:", error);
    throw error;
  }
};
