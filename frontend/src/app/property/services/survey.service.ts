import { api } from "../../../api";
import { SurveyDTO } from "../types/survey";

export const createSurvey = async (data: SurveyDTO) => {
    try {
        const response = await api.post('/properties/survey/create', data, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating Survey ", error);
        throw error;
    }
}