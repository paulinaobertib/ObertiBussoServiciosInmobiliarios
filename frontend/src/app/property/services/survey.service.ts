import { api } from "../../../api";
import { CreateSurveyDTO } from "../types/survey";

export const createSurvey = async (data: CreateSurveyDTO, token: string) => {
  try {
    const response = await api.post(
      `/properties/survey/create?token=${token}`,
      data,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating Survey", error);
    throw error;
  }
};

export const getAllSurveys = async () => {
  try {
    const response = await api.get(`/properties/survey/getAll`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all surveys", error);
    throw error;
  }
};

export const getAverageScore = async () => {
  try {
    const response = await api.get(
      `/properties/survey/statistics/averageScore`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching average score", error);
    throw error;
  }
};

export const getScoreDistribution = async () => {
  try {
    const response = await api.get(`/properties/survey/statistics/score`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching score distribution", error);
    throw error;
  }
};

export const getDailyAverageScore = async () => {
  try {
    const response = await api.get(`/properties/survey/statistics/daily`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching daily average score", error);
    throw error;
  }
};

export const getMonthlyAverageScore = async () => {
  try {
    const response = await api.get(`/properties/survey/statistics/monthly`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly average score", error);
    throw error;
  }
};
