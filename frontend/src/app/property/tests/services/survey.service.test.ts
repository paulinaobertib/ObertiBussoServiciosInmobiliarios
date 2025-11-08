import { describe, it, expect, vi, beforeEach } from "vitest";
import * as surveyService from "../../services/survey.service";
import { api } from "../../../../api";
import type { SurveyDTO, CreateSurveyDTO } from "../../types/survey";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("surveyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSurvey: SurveyDTO = {
    id: 1,
    score: 5,
    comment: "Excellent",
    inquiryId: 101,
  };

  const mockCreateSurvey: CreateSurveyDTO = {
    score: 4,
    comment: "Good",
    inquiryId: 102,
  };

  it("createSurvey crea una encuesta correctamente", async () => {
    (api.post as any).mockResolvedValue({ data: mockSurvey });

    const result = await surveyService.createSurvey(mockCreateSurvey, "mock-token");
    expect(api.post).toHaveBeenCalledWith(`/properties/survey/create?token=mock-token`, mockCreateSurvey, {
      withCredentials: true,
    });
    expect(result).toEqual(mockSurvey);
  });

  it("getAllSurveys devuelve todas las encuestas", async () => {
    (api.get as any).mockResolvedValue({ data: [mockSurvey] });

    const result = await surveyService.getAllSurveys();
    expect(api.get).toHaveBeenCalledWith("/properties/survey/getAll", { withCredentials: true });
    expect(result).toEqual([mockSurvey]);
  });

  it("getAverageScore devuelve promedio correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: 4.5 });

    const result = await surveyService.getAverageScore();
    expect(api.get).toHaveBeenCalledWith("/properties/survey/statistics/averageScore", { withCredentials: true });
    expect(result).toBe(4.5);
  });

  it("getScoreDistribution devuelve distribución correctamente", async () => {
    const mockDistribution = { 1: 2, 2: 3, 3: 5 };
    (api.get as any).mockResolvedValue({ data: mockDistribution });

    const result = await surveyService.getScoreDistribution();
    expect(api.get).toHaveBeenCalledWith("/properties/survey/statistics/score", { withCredentials: true });
    expect(result).toEqual(mockDistribution);
  });

  it("getDailyAverageScore devuelve promedio diario correctamente", async () => {
    const mockDaily = [{ date: "2025-08-21", average: 4 }];
    (api.get as any).mockResolvedValue({ data: mockDaily });

    const result = await surveyService.getDailyAverageScore();
    expect(api.get).toHaveBeenCalledWith("/properties/survey/statistics/daily", { withCredentials: true });
    expect(result).toEqual(mockDaily);
  });

  it("getMonthlyAverageScore devuelve promedio mensual correctamente", async () => {
    const mockMonthly = [{ month: "August", average: 4.2 }];
    (api.get as any).mockResolvedValue({ data: mockMonthly });

    const result = await surveyService.getMonthlyAverageScore();
    expect(api.get).toHaveBeenCalledWith("/properties/survey/statistics/monthly", { withCredentials: true });
    expect(result).toEqual(mockMonthly);
  });

  // --- Tests de errores ---
  it("lanza error si api.post falla en createSurvey", async () => {
    (api.post as any).mockRejectedValue(new Error("Post failed"));
    await expect(surveyService.createSurvey(mockCreateSurvey, "token")).rejects.toThrow("Post failed");
  });

  it("lanza error si api.get falla en getAllSurveys", async () => {
    (api.get as any).mockRejectedValue(new Error("Fetch all failed"));
    await expect(surveyService.getAllSurveys()).rejects.toThrow("Fetch all failed");
  });

  it("lanza error si api.get falla en getAverageScore", async () => {
    (api.get as any).mockRejectedValue(new Error("Average failed"));
    await expect(surveyService.getAverageScore()).rejects.toThrow("Average failed");
  });

  it("lanza error si api.get falla en getScoreDistribution", async () => {
    (api.get as any).mockRejectedValue(new Error("Distribution failed"));
    await expect(surveyService.getScoreDistribution()).rejects.toThrow("Distribution failed");
  });

  it("lanza error si api.get falla en getDailyAverageScore", async () => {
    (api.get as any).mockRejectedValue(new Error("Daily failed"));
    await expect(surveyService.getDailyAverageScore()).rejects.toThrow("Daily failed");
  });

  it("lanza error si api.get falla en getMonthlyAverageScore", async () => {
    (api.get as any).mockRejectedValue(new Error("Monthly failed"));
    await expect(surveyService.getMonthlyAverageScore()).rejects.toThrow("Monthly failed");
  });
});
