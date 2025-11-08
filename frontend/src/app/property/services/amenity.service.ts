import { Amenity, AmenityCreate } from "../types/amenity";
import { api } from "../../../api";

export const getAllAmenities = async () => {
  try {
    const response = await api.get(`/properties/amenity/getAll`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching amenities:", error);
    throw error;
  }
};

export const getAmenityById = async (id: number) => {
  try {
    const response = await api.get(`/properties/amenity/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching amenity with ID ${id}:`, error);
    throw error;
  }
};

export const postAmenity = async (amenityData: AmenityCreate) => {
  try {
    const response = await api.post(`/properties/amenity/create`, null, {
      params: { name: amenityData.name },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating amenity:", error);
    throw error;
  }
};

export const putAmenity = async (amenityData: Amenity) => {
  try {
    const response = await api.put(`/properties/amenity/update`, amenityData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving amenity:", error);
    throw error;
  }
};

export const deleteAmenity = async (amenityData: Amenity) => {
  try {
    const response = await api.delete(`/properties/amenity/delete/${amenityData.id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error deleting amenity:", error);
    throw error;
  }
};

export const getAmenitiesByText = async (search: string) => {
  try {
    const { data } = await api.get<Amenity[]>(`/properties/amenity/search`, {
      params: { search },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error searching by text:", error);
    throw error;
  }
};
