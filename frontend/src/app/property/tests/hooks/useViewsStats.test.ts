/// <reference types="vitest" />
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// --- Mock de TODOS los servicios con fábrica interna (evita hoisting issues)
vi.mock("../../services/view.service", () => ({
  getViewsByProperty: vi.fn(),
  getViewsByPropertyType: vi.fn(),
  getViewsByDay: vi.fn(),
  getViewsByMonth: vi.fn(),
  getViewsByNeighborhood: vi.fn(),
  getViewsByNeighborhoodType: vi.fn(),
  getViewsByStatus: vi.fn(),
  getViewsByStatusAndType: vi.fn(),
  getViewsByOperation: vi.fn(),
  getViewsByRooms: vi.fn(),
  getViewsByAmenity: vi.fn(),
}));

vi.mock("../../services/survey.service", () => ({
  getAllSurveys: vi.fn(),
  getAverageScore: vi.fn(),
  getScoreDistribution: vi.fn(),
  getDailyAverageScore: vi.fn(),
  getMonthlyAverageScore: vi.fn(),
}));

vi.mock("../../services/inquiry.service", () => ({
  getAverageInquiryResponseTime: vi.fn(),
  getInquiryStatusDistribution: vi.fn(),
  getInquiriesGroupedByDayOfWeek: vi.fn(),
  getInquiriesGroupedByTimeRange: vi.fn(),
  getInquiriesPerMonth: vi.fn(),
  getMostConsultedProperties: vi.fn(),
}));

// Mock de useErrors para no depender del AlertProvider real
const handleErrorMock = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

// IMPORTS del hook y (dinámicos) de los módulos mocked
import { useViewStats } from "../../hooks/useViewsStats";

let viewService: any;
let surveyService: any;
let inquiryService: any;

beforeAll(async () => {
  viewService = await import("../../services/view.service");
  surveyService = await import("../../services/survey.service");
  inquiryService = await import("../../services/inquiry.service");
});

describe("useViewStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("flujo OK: arranca con loading=true, resuelve todos los servicios y popula stats", async () => {
    // Datos fake
    const property = { "p-1": 10 };
    const propertyType = { casa: 5, depto: 7 };
    const day = { "2025-01-01": 3 };
    const month = { "2025-01": 12 };
    const neighborhood = { centro: 9 };
    const neighborhoodType = { barrioPrivado: 2 };
    const status = { disponible: 8, reservado: 1 };
    const statusAndType = { "disponible:casa": 4 };
    const operation = { VENTA: 6, ALQUILER: 3 };
    const rooms = { "2": 5, "3+": 7 };
    const amenity = { pileta: 4 };

    const surveyList = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const avgSurveyScore = 4.2;
    const surveyScoreDistribution = { 1: 0, 2: 1, 3: 2, 4: 4, 5: 6 };
    const surveyDailyAverageScore = { "2025-01-01": 4.5 };
    const surveyMonthlyAverageScore = { "2025-01": 4.1 };

    const inquiryResponseTime = { data: "02:15:00" };
    const inquiryStatusDistribution = { data: { abierta: 3, cerrada: 7 } };
    const inquiriesByDayOfWeek = { data: { Mon: 4, Tue: 2 } };
    const inquiriesByTimeRange = { data: { "09-12": 3, "12-18": 5 } };
    const inquiriesPerMonth = { data: { "2025-01": 10 } };
    const mostConsultedProperties = { data: { "prop-9": 6 } };

    // Configurar mocks
    viewService.getViewsByProperty.mockResolvedValueOnce(property);
    viewService.getViewsByPropertyType.mockResolvedValueOnce(propertyType);
    viewService.getViewsByDay.mockResolvedValueOnce(day);
    viewService.getViewsByMonth.mockResolvedValueOnce(month);
    viewService.getViewsByNeighborhood.mockResolvedValueOnce(neighborhood);
    viewService.getViewsByNeighborhoodType.mockResolvedValueOnce(neighborhoodType);
    viewService.getViewsByStatus.mockResolvedValueOnce(status);
    viewService.getViewsByStatusAndType.mockResolvedValueOnce(statusAndType);
    viewService.getViewsByOperation.mockResolvedValueOnce(operation);
    viewService.getViewsByRooms.mockResolvedValueOnce(rooms);
    viewService.getViewsByAmenity.mockResolvedValueOnce(amenity);

    surveyService.getAllSurveys.mockResolvedValueOnce(surveyList);
    surveyService.getAverageScore.mockResolvedValueOnce(avgSurveyScore);
    surveyService.getScoreDistribution.mockResolvedValueOnce(surveyScoreDistribution);
    surveyService.getDailyAverageScore.mockResolvedValueOnce(surveyDailyAverageScore);
    surveyService.getMonthlyAverageScore.mockResolvedValueOnce(surveyMonthlyAverageScore);

    inquiryService.getAverageInquiryResponseTime.mockResolvedValueOnce(inquiryResponseTime);
    inquiryService.getInquiryStatusDistribution.mockResolvedValueOnce(inquiryStatusDistribution);
    inquiryService.getInquiriesGroupedByDayOfWeek.mockResolvedValueOnce(inquiriesByDayOfWeek);
    inquiryService.getInquiriesGroupedByTimeRange.mockResolvedValueOnce(inquiriesByTimeRange);
    inquiryService.getInquiriesPerMonth.mockResolvedValueOnce(inquiriesPerMonth);
    inquiryService.getMostConsultedProperties.mockResolvedValueOnce(mostConsultedProperties);

    const { result } = renderHook(() => useViewStats());

    // Comienza en true
    expect(result.current.loading).toBe(true);

    // Esperar a que termine la Promise.all
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Sin errores
    expect(handleErrorMock).not.toHaveBeenCalled();

    // Stats consolidados
    expect(result.current.stats).toEqual({
      property,
      propertyType,
      day,
      month,
      neighborhood,
      neighborhoodType,
      status,
      statusAndType,
      operation,
      rooms,
      amenity,
      surveysCount: surveyList.length,
      averageSurveyScore: avgSurveyScore,
      surveyScoreDistribution,
      surveyDailyAverageScore,
      surveyMonthlyAverageScore,
      inquiryResponseTime: inquiryResponseTime.data,
      inquiryStatusDistribution: inquiryStatusDistribution.data,
      inquiriesByDayOfWeek: inquiriesByDayOfWeek.data,
      inquiriesByTimeRange: inquiriesByTimeRange.data,
      inquiriesPerMonth: inquiriesPerMonth.data,
      mostConsultedProperties: mostConsultedProperties.data,
    });

    // Cada endpoint, 1 vez
    [
      viewService.getViewsByProperty,
      viewService.getViewsByPropertyType,
      viewService.getViewsByDay,
      viewService.getViewsByMonth,
      viewService.getViewsByNeighborhood,
      viewService.getViewsByNeighborhoodType,
      viewService.getViewsByStatus,
      viewService.getViewsByStatusAndType,
      viewService.getViewsByOperation,
      viewService.getViewsByRooms,
      viewService.getViewsByAmenity,
    ].forEach((fn: any) => expect(fn).toHaveBeenCalledTimes(1));

    [
      surveyService.getAllSurveys,
      surveyService.getAverageScore,
      surveyService.getScoreDistribution,
      surveyService.getDailyAverageScore,
      surveyService.getMonthlyAverageScore,
    ].forEach((fn: any) => expect(fn).toHaveBeenCalledTimes(1));

    [
      inquiryService.getAverageInquiryResponseTime,
      inquiryService.getInquiryStatusDistribution,
      inquiryService.getInquiriesGroupedByDayOfWeek,
      inquiryService.getInquiriesGroupedByTimeRange,
      inquiryService.getInquiriesPerMonth,
      inquiryService.getMostConsultedProperties,
    ].forEach((fn: any) => expect(fn).toHaveBeenCalledTimes(1));
  });

  it("si alguna llamada falla: handleError es llamado y loading=false; stats quedan con defaults", async () => {
    viewService.getViewsByProperty.mockRejectedValueOnce(new Error("boom"));

    // El resto mocked para existir (no necesariamente se ejecutan por Promise.all)
    viewService.getViewsByPropertyType.mockResolvedValue({});
    viewService.getViewsByDay.mockResolvedValue({});
    viewService.getViewsByMonth.mockResolvedValue({});
    viewService.getViewsByNeighborhood.mockResolvedValue({});
    viewService.getViewsByNeighborhoodType.mockResolvedValue({});
    viewService.getViewsByStatus.mockResolvedValue({});
    viewService.getViewsByStatusAndType.mockResolvedValue({});
    viewService.getViewsByOperation.mockResolvedValue({});
    viewService.getViewsByRooms.mockResolvedValue({});
    viewService.getViewsByAmenity.mockResolvedValue({});

    surveyService.getAllSurveys.mockResolvedValue([]);
    surveyService.getAverageScore.mockResolvedValue(0);
    surveyService.getScoreDistribution.mockResolvedValue({});
    surveyService.getDailyAverageScore.mockResolvedValue({});
    surveyService.getMonthlyAverageScore.mockResolvedValue({});

    inquiryService.getAverageInquiryResponseTime.mockResolvedValue({ data: "" });
    inquiryService.getInquiryStatusDistribution.mockResolvedValue({ data: {} });
    inquiryService.getInquiriesGroupedByDayOfWeek.mockResolvedValue({ data: {} });
    inquiryService.getInquiriesGroupedByTimeRange.mockResolvedValue({ data: {} });
    inquiryService.getInquiriesPerMonth.mockResolvedValue({ data: {} });
    inquiryService.getMostConsultedProperties.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useViewStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(handleErrorMock).toHaveBeenCalledTimes(1);

    const s = result.current.stats;
    expect(s.property).toEqual({});
    expect(s.propertyType).toEqual({});
    expect(s.day).toEqual({});
    expect(s.month).toEqual({});
    expect(s.neighborhood).toEqual({});
    expect(s.neighborhoodType).toEqual({});
    expect(s.status).toEqual({});
    expect(s.statusAndType).toEqual({});
    expect(s.operation).toEqual({});
    expect(s.rooms).toEqual({});
    expect(s.amenity).toEqual({});
    expect(s.surveysCount).toBe(0);
    expect(s.averageSurveyScore).toBe(0);
    expect(s.inquiryResponseTime).toBe("");
  });
});
