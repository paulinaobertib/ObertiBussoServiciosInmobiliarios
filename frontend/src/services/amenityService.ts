import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
import { Amenity } from "../types/amenity";

export const getAllAmenities = async () => {
  try {
    const response = await axios.get(`${apiUrl}/amenity/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching amenities:", error);
    throw error;
  }
};

export const getAmenityById = async (id: number) => {
  try {
    const response = await axios.get(`${apiUrl}/amenity/getById/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching amenity with ID ${id}:`, error);
    throw error;
  }
};

export const postAmenity = async (amenityData: Amenity) => {
  try {
    const response = await axios.post(`${apiUrl}/amenity/create`, null, {
      params: {
        name: amenityData.name,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating amenity:", error);
    throw error;
  }
};

export const putAmenity = async (amenityData: Amenity) => {
  try {
    const response = await axios.put(`${apiUrl}/amenity/update`, amenityData);
    return response.data;
  } catch (error) {
    console.error("Error saving amenity:", error);
    throw error;
  }
};

export const deleteAmenity = async (amenityData: Amenity) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/amenity/delete/${amenityData.id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting amenity:", error);
    throw error;
  }
};
