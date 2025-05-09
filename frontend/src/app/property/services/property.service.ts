import axios from "axios";
import { Property, PropertyUpdate, PropertyCreate } from "../types/property";

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
    return (await axios.post(`${apiUrl}/properties/property/create`, form))
      .data;
  } catch (error) {
    console.error("Error saving property:", error);
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

  /* ③  Sólo adjuntar si es File (=> hay cambio) */
  if (mainImage instanceof File) {
    form.append("mainImage", mainImage);
  }

  const { data: updated } = await axios.put(
    `${apiUrl}/properties/property/update/${id}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return updated;
};

export const deleteProperty = async (data: Property) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/properties/property/delete/${data.id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
};

export const getAllProperties = async () => {
  try {
    const response = await axios.get(`${apiUrl}/properties/property/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

export const getPropertyById = async (id: number) => {
  try {
    const response = await axios.get(
      `${apiUrl}/properties/property/getById/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching property with ID ${id}:`, error);
    throw error;
  }
};
