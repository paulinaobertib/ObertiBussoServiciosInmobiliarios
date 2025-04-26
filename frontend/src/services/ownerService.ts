import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export const getAllOwners = async () => {
  try {
    const response = await axios.get(`${apiUrl}/owner/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching owners:", error);
    throw error;
  }
};
