import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export const getAllProperties = async () => {
  try {
    const response = await axios.get(`${apiUrl}/property/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};