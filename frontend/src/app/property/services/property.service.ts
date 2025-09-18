import { Property, PropertyUpdate, PropertyCreate } from "../types/property";
import { SearchParams } from "../types/searchParams";
import { api } from "../../../api";


export const postProperty = async (data: PropertyCreate) => {
  const form = new FormData();
  const { mainImage, images, ...plainFields } = data;

  form.append(
    "data",
    new Blob([JSON.stringify(plainFields)], { type: "application/json" })
  );

  if (mainImage) form.append("mainImage", mainImage);
  images.forEach((img) => form.append("images", img));

  try {
    const response = await api.post(
      `/properties/property/create`,
      form,
      { withCredentials: true }
    );
    return (response as any)?.data ?? response;
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
};

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
    const response = await api.put(
      `/properties/property/update/${id}`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );
    return (response as any)?.data ?? response;
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
};

export const deleteProperty = async (data: Property) => {
  try {
    const response = await api.delete(
      `/properties/property/delete/${data.id}`,
      { withCredentials: true }
    );
    return (response as any)?.data ?? response;
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
};

export const getAllProperties = async () => {
  try {
    const response = await api.get(`/properties/property/getAll`, {
      withCredentials: true,
    });
    return (response as any)?.data ?? response;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

export const getAvailableProperties = async () => {
  try {
    const response = await api.get(`/properties/property/get`, {
      withCredentials: true,
    });
    return (response as any)?.data ?? response;
  } catch (error) {
    console.error("Error fetching available properties:", error);
    throw error;
  }
};

export const getPropertyById = async (id: number) => {
  try {
    const response = await api.get(`/properties/property/getById/${id}`, {
      withCredentials: true,
    });
    return (response as any)?.data ?? response;
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
    const response = await api.get<Property[]>(
      `/properties/property/search?${searchParams.toString()}`,
      { withCredentials: true }
    );
    return (response as any)?.data ?? response;
  } catch (error) {
    console.error("Error searching properties:", error);
    throw error;
  }
};

export const getPropertiesByText = async (value: string) => {
  try {
    const response = await api.get<Property[]>(`/properties/property/text`, {
      params: { value },
      withCredentials: true,
    });
    return (response as any)?.data ?? response;
  } catch (error) {
    console.error("Error searching by text:", error);
    throw error;
  }
};

export const putPropertyStatus = async (id: number, status: string) => {
  try {
    const response = await api.put(`/properties/property/status/${id}`, null, {
      params: { status },
      withCredentials: true,
    });
    return (response as any)?.data ?? response;
  } catch (error) {
    console.error("Error updating property status:", error);
    throw error;
  }
};

export const putPropertyOutstanding = async (id: number, outstanding: boolean) => {
  try {
    const response = await api.put(`/properties/property/outstanding/${id}`, null, {
      params: { outstanding },
      withCredentials: true,
    });
    return (response as any)?.data ?? response;
  } catch (error) {
    console.error("Error updating property outstanding:", error);
    throw error;
  }
};
