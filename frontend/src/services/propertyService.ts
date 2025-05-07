import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export const getAllProperties = async () => {
  try {
    const response = await axios.get(`${apiUrl}/properties/property/getAll`);
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};
