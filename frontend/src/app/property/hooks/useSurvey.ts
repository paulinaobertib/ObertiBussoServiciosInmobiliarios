import { useState } from "react";
import { createSurvey } from "../services/survey.service";
import { SurveyDTO } from "../types/survey";

export const useSurvey = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const postSurvey = async (data: SurveyDTO) => {
        setLoading(true)
        setError(null)
        try {
            const response = await createSurvey(data)
            setResult(response)
            return result
        } catch (error: any) {
            setError(error?.response.data || "Error desconocido");
        } finally {
            setLoading(false)
        }
    }
    
    return { postSurvey, loading, error }
}