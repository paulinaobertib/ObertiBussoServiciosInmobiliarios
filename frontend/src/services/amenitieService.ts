import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export const getAllAmenities = async () => {
  try {
    const response = await axios.get(`${apiUrl}/amenity/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching amenities:", error);
    throw error;
  }
};
