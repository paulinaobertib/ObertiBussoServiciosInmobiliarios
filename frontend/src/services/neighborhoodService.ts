import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export const getAllNeighborhood = async () => {
  try {
    const response = await axios.get(`${apiUrl}/neighborhood/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching property types:", error);
    throw error;
  }
};
