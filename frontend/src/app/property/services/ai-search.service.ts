import { api } from "../../../api";
import { PropertySimple } from "../types/property";

export const searchPropertiesWithAI = async (query: string): Promise<PropertySimple[]> => {
  try {
    const response = await api.get<PropertySimple[]>(`/properties/compare/search`, {
      params: { query },
      withCredentials: true,
    });
    return (response as any)?.data ?? response;
  } catch (error) {
    console.error("Error searching properties with AI:", error);
    throw error;
  }
};
