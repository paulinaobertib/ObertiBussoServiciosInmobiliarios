import axios from "axios";
import { Owner, OwnerCreate } from "../types/owner";

const apiUrl = import.meta.env.VITE_API_URL;

export const postOwner = async (ownerData: OwnerCreate) => {
  try {
    const response = await axios.post(
      `${apiUrl}/properties/owner/create`,
      ownerData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating owner:", error);
    throw error;
  }
};

export const putOwner = async (ownerData: Owner) => {
  try {
    const response = await axios.put(
      `${apiUrl}/properties/owner/update`,
      ownerData
    );
    return response.data;
  } catch (error) {
    console.error("Error saving owner:", error);
    throw error;
  }
};

export const deleteOwner = async (ownerData: Owner) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/properties/owner/delete/${ownerData.id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting owner:", error);
    throw error;
  }
};

export const getAllOwners = async () => {
  try {
    const response = await axios.get(`${apiUrl}/properties/owner/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching owners:", error);
    throw error;
  }
};

export const getOwnerById = async (id: number) => {
  try {
    const response = await axios.get(
      `${apiUrl}/properties/owner/getById/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching owner with ID ${id}:`, error);
    throw error;
  }
};

export const getOwnerByPropertyId = async (id: number) => {
  try {
    const response = await axios.get(
      `${apiUrl}/properties/owner/getByProperty/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching owner with ID ${id}:`, error);
    throw error;
  }
};
