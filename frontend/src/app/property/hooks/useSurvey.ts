import { useState } from "react";
import { createSurvey } from "../services/survey.service";
import { CreateSurveyDTO } from "../types/survey";

export const useSurvey = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const postSurvey = async (data: CreateSurveyDTO, token: string ) => {
        setLoading(true)
        setError(null)
        try {
            const response = await createSurvey(data, token)
            return response
        } catch (error: any) {
            setError(error?.response?.data || "Error desconocido");
            throw error; 
        } finally {
            setLoading(false)
        }
    }
    
    return { postSurvey, loading, error }
}