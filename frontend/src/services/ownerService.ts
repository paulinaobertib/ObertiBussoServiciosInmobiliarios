import axios from "axios";
import { Owner } from "../types/owner"; // donde tengas tu interfaz Owner

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

export const getOwnerById = async (id: number) => {
  try {
    const response = await axios.get(`${apiUrl}/owner/getById/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching owner with ID ${id}:`, error);
    throw error;
  }
};

export const postOwner = async (ownerData: Owner) => {
  try {
    const response = await axios.post(`${apiUrl}/owner/create`, ownerData);
    return response.data;
  } catch (error) {
    console.error("Error creating owner:", error);
    throw error;
  }
};
