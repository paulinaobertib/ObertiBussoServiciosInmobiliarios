import axios from "axios";
import { Property, PropertyUpdate, PropertyCreate } from "../types/property";
import { SearchParams } from "../types/searchParams";

const apiUrl = import.meta.env.VITE_API_URL;

export async function postProperty(data: PropertyCreate) {
  const form = new FormData();
  const { mainImage, images, ...plainFields } = data;

  form.append(
    "data",
    new Blob([JSON.stringify(plainFields)], { type: "application/json" })
  );

  if (mainImage) form.append("mainImage", mainImage);
  images.forEach((img) => form.append("images", img));

  try {
    const { data: created } = await axios.post(
      `${apiUrl}/properties/property/create`,
      form,
      { withCredentials: true }
    );
    return created;
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
}

export const putProperty = async (data: PropertyUpdate) => {
  const { id, mainImage, ...plainFields } = data;
  const form = new FormData();

  form.append(
    "data",
    new Blob([JSON.stringify(plainFields)], { type: "application/json" })
  );

  if (mainImage instanceof File) {
    form.append("mainImage", mainImage);
  }

  try {
    const { data: updated } = await axios.put(
      `${apiUrl}/properties/property/update/${id}`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );
    return updated;
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
};

export const deleteProperty = async (data: Property) => {
  try {
    const { data: deleted } = await axios.delete(
      `${apiUrl}/properties/property/delete/${data.id}`,
      { withCredentials: true }
    );
    return deleted;
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
};

export const getAllProperties = async () => {
  try {
    const { data } = await axios.get(`${apiUrl}/properties/property/getAll`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

export const getPropertyById = async (id: number) => {
  try {
    const { data } = await axios.get(
      `${apiUrl}/properties/property/getById/${id}`,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    console.error(`Error fetching property with ID ${id}:`, error);
    throw error;
  }
};

export const getPropertiesByFilters = async (
  params: SearchParams
): Promise<Property[]> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else if (value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  try {
    const { data } = await axios.get<Property[]>(
      `${apiUrl}/properties/property/search?${searchParams.toString()}`,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    console.error("Error searching properties:", error);
    throw error;
  }
};

export const getPropertiesByText = async (value: string) => {
  try {
    const { data } = await axios.get<Property[]>(
      `${apiUrl}/properties/property/text`,
      {
        params: { value },
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    console.error("Error searching by text:", error);
    throw error;
  }
};

export const putPropertyStatus = async (id: number, status: string) => {
  try {
    const { data } = await axios.put(
      `${apiUrl}/properties/property/status/${id}`,
      null,
      {
        params: { status },
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    console.error("Error updating property status:", error);
    throw error;
  }
};
