import { SuggestionCreate } from "../types/suggestion";
import { api } from "../../../api";

export const postSuggestion = async (data: SuggestionCreate) => {
  try {
    const formData = new FormData();
    formData.append("description", data.description);

    const response = await api.post("/properties/suggestions/create", formData);
    return response.data;
  } catch (error) {
    console.error("Error creating suggestion:", error);
    throw error;
  }
};

export const getAllSuggestions = async () => {
  try {
    const response = await api.get("/properties/suggestions/getAll");
    return response.data;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    throw error;
  }
};
