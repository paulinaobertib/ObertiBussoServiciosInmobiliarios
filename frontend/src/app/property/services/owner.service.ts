import { Owner, OwnerCreate } from "../types/owner";
import { api } from "../../../api";
import { getAllProperties } from "./property.service";
import { Property } from "../types/property";

export const postOwner = async (ownerData: OwnerCreate) => {
  try {
    const response = await api.post(`/properties/owner/create`, ownerData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating owner:", error);
    throw error;
  }
};

export const putOwner = async (ownerData: Owner) => {
  try {
    const response = await api.put(`/properties/owner/update`, ownerData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving owner:", error);
    throw error;
  }
};

export const deleteOwner = async (ownerData: Owner) => {
  try {
    const response = await api.delete(`/properties/owner/delete/${ownerData.id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error deleting owner:", error);
    throw error;
  }
};

export const getAllOwners = async () => {
  try {
    const response = await api.get(`/properties/owner/getAll`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching owners:", error);
    throw error;
  }
};

export const getOwnerById = async (id: number) => {
  try {
    const response = await api.get(`/properties/owner/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching owner with ID ${id}:`, error);
    throw error;
  }
};

export const getOwnerByPropertyId = async (id: number) => {
  try {
    const response = await api.get(`/properties/owner/getByProperty/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching owner with ID ${id}:`, error);
    throw error;
  }
};

export const getPropertiesByOwner = async (ownerId: number): Promise<Property[]> => {
  const all = await getAllProperties();
  const props: Property[] = Array.isArray(all) ? all : (all as any)?.data ?? [];

  const wanted = Number(ownerId);
  const batchSize = 8; // tamaño del lote para limitar concurrencia
  const result: Property[] = [];

  for (let i = 0; i < props.length; i += batchSize) {
    const chunk = props.slice(i, i + batchSize);

    const owners = await Promise.all(
      chunk.map(
        (p) => getOwnerByPropertyId(Number(p.id)).catch(() => null) // tolerante a errores
      )
    );

    owners.forEach((own, idx) => {
      if (own && Number(own.id) === wanted) {
        result.push(chunk[idx]);
      }
    });
  }

  return result;
};

export const getOwnersByText = async (search: string) => {
  try {
    const { data } = await api.get<Owner[]>(`/properties/owner/search`, {
      params: { search },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error searching by text:", error);
    throw error;
  }
};
