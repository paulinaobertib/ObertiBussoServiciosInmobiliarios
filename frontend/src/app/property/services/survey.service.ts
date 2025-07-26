import { api } from "../../../api";
import { CreateSurveyDTO } from "../types/survey";

export const createSurvey = async (data: CreateSurveyDTO, token: string) => {
    try {
        const response = await api.post(`/properties/survey/create?token=${token}`, data, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating Survey ", error);
        throw error;
    }
}

