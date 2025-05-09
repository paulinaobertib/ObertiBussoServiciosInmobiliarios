import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
import { Amenity, AmenityCreate } from "../types/amenity";

export const getAllAmenities = async () => {
  try {
    const response = await axios.get(`${apiUrl}/properties/amenity/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching amenities:", error);
    throw error;
  }
};

export const getAmenityById = async (id: number) => {
  try {
    const response = await axios.get(
      `${apiUrl}/properties/amenity/getById/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching amenity with ID ${id}:`, error);
    throw error;
  }
};

export const postAmenity = async (amenityData: AmenityCreate) => {
  try {
    const response = await axios.post(
      `${apiUrl}/properties/amenity/create`,
      null,
      {
        params: {
          name: amenityData.name,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating amenity:", error);
    throw error;
  }
};

export const putAmenity = async (amenityData: Amenity) => {
  try {
    const response = await axios.put(
      `${apiUrl}/properties/amenity/update`,
      amenityData
    );
    return response.data;
  } catch (error) {
    console.error("Error saving amenity:", error);
    throw error;
  }
};

export const deleteAmenity = async (amenityData: Amenity) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/properties/amenity/delete/${amenityData.id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting amenity:", error);
    throw error;
  }
};

