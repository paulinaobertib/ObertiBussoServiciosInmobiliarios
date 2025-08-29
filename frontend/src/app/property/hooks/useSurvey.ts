import { useState } from "react";
import { createSurvey } from "../services/survey.service";
import { CreateSurveyDTO } from "../types/survey";
import { useApiErrors } from "../../shared/hooks/useErrors";

export const useSurvey = () => {
  const [loading, setLoading] = useState(false);
  const { handleError } = useApiErrors();

  const postSurvey = async (data: CreateSurveyDTO, token: string) => {
    setLoading(true);
    try {
      const response = await createSurvey(data, token);
      return response;
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  return { postSurvey, loading };
};