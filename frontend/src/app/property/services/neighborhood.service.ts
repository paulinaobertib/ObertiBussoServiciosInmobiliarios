import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
import { Neighborhood, NeighborhoodCreate } from "../types/neighborhood";

export const getAllNeighborhoods = async () => {
  try {
    const response = await axios.get(`${apiUrl}/properties/neighborhood/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching property types:", error);
    throw error;
  }
};

export const getNeighborhoodById = async (id: number) => {
  try {
    const response = await axios.get(`${apiUrl}/properties/neighborhood/getById/${id}`);
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
    const response = await axios.post(
      `${apiUrl}/properties/neighborhood/create`,
      neighborhoodData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating neighborhood:", error);
    throw error;
  }
};

export const putNeighborhood = async (neighborhoodData: Neighborhood) => {
  try {
    const response = await axios.put(
      `${apiUrl}/properties/neighborhood/update/${neighborhoodData.id}`,
      neighborhoodData,
      {
        headers: {
          "Content-Type": "application/json",
        },
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
    const response = await axios.delete(
      `${apiUrl}/properties/neighborhood/delete/${neighborhoodData.id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting neighborhood:", error);
    throw error;
  }
};

