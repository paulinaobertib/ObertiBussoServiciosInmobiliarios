import { renderHook, waitFor } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { useViewStats } from "../../hooks/useViewsStats";
import * as viewService from "../../services/view.service";
import * as surveyService from "../../services/survey.service";
import * as inquiryService from "../../services/inquiry.service";

vi.mock("../../services/view.service");
vi.mock("../../services/survey.service");
vi.mock("../../services/inquiry.service");

describe("useViewStats hook", () => {
  const fakeViews = { a: 1 };
  const fakeSurveys = [{ id: 1, score: 5 }];
  const fakeAvgScore = 4.5;
  const fakeScoreDistrib = { 5: 2 };
  const fakeDailyAvg = { "2025-08-21": 4.5 };
  const fakeMonthlyAvg = { "2025-08": 4.5 };
  const fakeInquiryRespTime = { data: "2 days" };
  const fakeInquiryStatusDist = { data: { open: 2, closed: 3 } };
  const fakeByDay = { data: { Mon: 5 } };
  const fakeByTime = { data: { "09-12": 3 } };
  const fakePerMonth = { data: { "2025-08": 5 } };
  const fakeMostProps = { data: { prop1: 10 } };

  beforeEach(() => {
    vi.clearAllMocks();

    // Views
    (viewService.getViewsByProperty as Mock).mockResolvedValue(fakeViews);
    (viewService.getViewsByPropertyType as Mock).mockResolvedValue(fakeViews);
    (viewService.getViewsByDay as Mock).mockResolvedValue(fakeViews);
    (viewService.getViewsByMonth as Mock).mockResolvedValue(fakeViews);
    (viewService.getViewsByNeighborhood as Mock).mockResolvedValue(fakeViews);
    (viewService.getViewsByNeighborhoodType as Mock).mockResolvedValue(fakeViews);
    (viewService.getViewsByStatus as Mock).mockResolvedValue(fakeViews);
    (viewService.getViewsByStatusAndType as Mock).mockResolvedValue(fakeViews);
    (viewService.getViewsByOperation as Mock).mockResolvedValue(fakeViews);
    (viewService.getViewsByRooms as Mock).mockResolvedValue(fakeViews);
    (viewService.getViewsByAmenity as Mock).mockResolvedValue(fakeViews);

    // Surveys
    (surveyService.getAllSurveys as Mock).mockResolvedValue(fakeSurveys);
    (surveyService.getAverageScore as Mock).mockResolvedValue(fakeAvgScore);
    (surveyService.getScoreDistribution as Mock).mockResolvedValue(fakeScoreDistrib);
    (surveyService.getDailyAverageScore as Mock).mockResolvedValue(fakeDailyAvg);
    (surveyService.getMonthlyAverageScore as Mock).mockResolvedValue(fakeMonthlyAvg);

    // Inquiries
    (inquiryService.getAverageInquiryResponseTime as Mock).mockResolvedValue(fakeInquiryRespTime);
    (inquiryService.getInquiryStatusDistribution as Mock).mockResolvedValue(fakeInquiryStatusDist);
    (inquiryService.getInquiriesGroupedByDayOfWeek as Mock).mockResolvedValue(fakeByDay);
    (inquiryService.getInquiriesGroupedByTimeRange as Mock).mockResolvedValue(fakeByTime);
    (inquiryService.getInquiriesPerMonth as Mock).mockResolvedValue(fakePerMonth);
    (inquiryService.getMostConsultedProperties as Mock).mockResolvedValue(fakeMostProps);
  });

  it("carga todas las estadísticas correctamente", async () => {
    const { result } = renderHook(() => useViewStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.property).toEqual(fakeViews);
    expect(result.current.stats.surveysCount).toBe(fakeSurveys.length);
    expect(result.current.stats.averageSurveyScore).toBe(fakeAvgScore);
    expect(result.current.stats.surveyScoreDistribution).toEqual(fakeScoreDistrib);
    expect(result.current.stats.surveyDailyAverageScore).toEqual(fakeDailyAvg);
    expect(result.current.stats.surveyMonthlyAverageScore).toEqual(fakeMonthlyAvg);
    expect(result.current.stats.inquiryResponseTime).toBe(fakeInquiryRespTime.data);
    expect(result.current.stats.inquiryStatusDistribution).toEqual(fakeInquiryStatusDist.data);
    expect(result.current.stats.inquiriesByDayOfWeek).toEqual(fakeByDay.data);
    expect(result.current.stats.inquiriesByTimeRange).toEqual(fakeByTime.data);
    expect(result.current.stats.inquiriesPerMonth).toEqual(fakePerMonth.data);
    expect(result.current.stats.mostConsultedProperties).toEqual(fakeMostProps.data);
    expect(result.current.error).toBeNull();
  });

  it("maneja errores correctamente", async () => {
    const errorMsg = "Failed to fetch";
    (viewService.getViewsByProperty as Mock).mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useViewStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(errorMsg);
  });
});
