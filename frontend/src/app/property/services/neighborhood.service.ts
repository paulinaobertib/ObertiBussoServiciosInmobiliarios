import { Neighborhood, NeighborhoodCreate } from "../types/neighborhood";
import { api } from "../../../api";

export const getAllNeighborhoods = async () => {
  try {
    const response = await api.get(`/properties/neighborhood/getAll`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching property neighborhoods:", error);
    throw error;
  }
};

export const getNeighborhoodById = async (id: number) => {
  try {
    const response = await api.get(`/properties/neighborhood/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching neighborhood with ID ${id}:`, error);
    throw error;
  }
};

export const postNeighborhood = async (
  neighborhoodData: NeighborhoodCreate
) => {
  try {
    const response = await api.post(
      `/properties/neighborhood/create`,
      neighborhoodData,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating neighborhood:", error);
    throw error;
  }
};

export const putNeighborhood = async (neighborhoodData: Neighborhood) => {
  try {
    const response = await api.put(
      `/properties/neighborhood/update/${neighborhoodData.id}`,
      neighborhoodData,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving neighborhood:", error);
    throw error;
  }
};

export const deleteNeighborhood = async (neighborhoodData: Neighborhood) => {
  try {
    const response = await api.delete(
      `/properties/neighborhood/delete/${neighborhoodData.id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting neighborhood:", error);
    throw error;
  }
};

export const getNeighborhoodByText = async (search: string) => {
  try {
    const { data } = await api.get<Neighborhood[]>(
      `/properties/neighborhood/search`,
      {
        params: { search },
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    console.error("Error searching by text:", error);
    throw error;
  }
};
