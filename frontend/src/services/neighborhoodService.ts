import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
import { Neighborhood } from "../types/neighborhood";

export const getAllNeighborhood = async () => {
  try {
    const response = await axios.get(`${apiUrl}/neighborhood/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching property types:", error);
    throw error;
  }
};

export const getNeighborhoodById = async (id: number) => {
  try {
    const response = await axios.get(`${apiUrl}/neighborhood/getById/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching neighborhood with ID ${id}:`, error);
    throw error;
  }
};

export const postNeighborhood = async (neighborhoodData: Neighborhood) => {
  try {
    const response = await axios.post(
      `${apiUrl}/neighborhood/create`,
      neighborhoodData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating neighborhood:", error);
    throw error;
  }
};

export const putNeighborhood = async (neighborhoodData: Neighborhood) => {
  console.log(`PUT URL: ${apiUrl}/neighborhood/update/${neighborhoodData.id}`);
  try {
    const response = await axios.put(
      `${apiUrl}/neighborhood/update/${neighborhoodData.id}`,
      neighborhoodData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("PUT OK:", response.data); // <--- ahora usamos console.log
    return response.data;
  } catch (error) {
    console.error("Error saving neighborhood:", error); // <-- ya estás imprimiendo el error acá
    throw error;
  }
};

export const deleteNeighborhood = async (neighborhoodData: Neighborhood) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/neighborhood/delete/${neighborhoodData.id}`
    );
    console.log("DELETE OK:", response.data); // <--- ahora usamos console.log
    return response.data;
  } catch (error) {
    console.error("Error deleting neighborhood:", error); // <-- ya estás imprimiendo el error acá
    throw error;
  }
};
