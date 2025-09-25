/// <reference types="vitest" />
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// ---- MOCKS ----
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

// contractStats hook
vi.mock("../../../user/hooks/contracts/useContractStats", () => ({
  useContractStats: () => ({
    getCountByStatus: vi.fn().mockResolvedValue({ ACTIVO: 0, INACTIVO: 0 }),
    getCountByType: vi.fn().mockResolvedValue({
      VIVIENDA: 0,
      COMERCIAL: 0,
      TEMPORAL: 0,
    }),
  }),
}));

// commissions
vi.mock("../../../user/services/commission.service", () => ({
  countCommissionsByStatus: vi.fn().mockResolvedValue({
    PAGADA: 0,
    PARCIAL: 0,
    PENDIENTE: 0,
  }),
  getTotalAmountByStatus: vi.fn().mockResolvedValue(0),
  getDateTotals: vi.fn().mockResolvedValue(0),
  getYearMonthlyTotals: vi.fn().mockResolvedValue({}),
  getCommissionsByPaymentType: vi.fn().mockResolvedValue([]),
  getCommissionsByStatus: vi.fn().mockResolvedValue([]),
}));

// payments
vi.mock("../../../user/services/payment.service", () => ({
  getPaymentsByDateRange: vi.fn().mockResolvedValue([]),
  getPaymentsByCurrency: vi.fn().mockResolvedValue([]),
  getPaymentsByContractRange: vi.fn().mockResolvedValue([]),
  getPaymentsByCommissionRange: vi.fn().mockResolvedValue([]),
  getPaymentsByUtilityRange: vi.fn().mockResolvedValue([]),
}));

// useErrors
const handleErrorMock = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

// SUT
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

  it("flujo OK: resuelve servicios y llena stats (con defaults de comisiones/pagos)", async () => {
    // datos fake mínimos
    viewService.getViewsByProperty.mockResolvedValueOnce({ "p-1": 10 });
    viewService.getViewsByPropertyType.mockResolvedValueOnce({ casa: 2 });
    viewService.getViewsByDay.mockResolvedValueOnce({ "2025-01-01": 3 });
    viewService.getViewsByMonth.mockResolvedValueOnce({ "2025-01": 5 });
    viewService.getViewsByNeighborhood.mockResolvedValueOnce({ centro: 1 });
    viewService.getViewsByNeighborhoodType.mockResolvedValueOnce({ barrio: 1 });
    viewService.getViewsByStatus.mockResolvedValueOnce({ DISPONIBLE: 4 });
    viewService.getViewsByStatusAndType.mockResolvedValueOnce({ "DISPONIBLE:casa": 2 });
    viewService.getViewsByOperation.mockResolvedValueOnce({ VENTA: 2 });
    viewService.getViewsByRooms.mockResolvedValueOnce({ "2": 1 });
    viewService.getViewsByAmenity.mockResolvedValueOnce({ pileta: 1 });

    surveyService.getAllSurveys.mockResolvedValueOnce([{ id: 1 }]);
    surveyService.getAverageScore.mockResolvedValueOnce(4.5);
    surveyService.getScoreDistribution.mockResolvedValueOnce({ 5: 1 });
    surveyService.getDailyAverageScore.mockResolvedValueOnce({ "2025-01-01": 4.5 });
    surveyService.getMonthlyAverageScore.mockResolvedValueOnce({ "2025-01": 4.5 });

    inquiryService.getAverageInquiryResponseTime.mockResolvedValueOnce({ data: "01:00:00" });
    inquiryService.getInquiryStatusDistribution.mockResolvedValueOnce({ data: { abierta: 1 } });
    inquiryService.getInquiriesGroupedByDayOfWeek.mockResolvedValueOnce({ data: { Mon: 1 } });
    inquiryService.getInquiriesGroupedByTimeRange.mockResolvedValueOnce({ data: { "09-12": 1 } });
    inquiryService.getInquiriesPerMonth.mockResolvedValueOnce({ data: { "2025-01": 1 } });
    inquiryService.getMostConsultedProperties.mockResolvedValueOnce({ data: { "p-1": 1 } });

    const { result } = renderHook(() => useViewStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Tiene al menos parte de views y surveys
    expect(result.current.stats.property).toEqual({ "p-1": 10 });
    expect(result.current.stats.averageSurveyScore).toBe(4.5);
    expect(result.current.stats.inquiryResponseTime).toBe("01:00:00");

    // Defaults de commissions / payments
    expect(result.current.stats.commissionsTotalInDateRange).toBe(0);
    expect(result.current.stats.paymentsTotalInDateRange).toBe(0);
    expect(result.current.stats.paymentsCountByCurrency).toEqual({ ARS: 0, USD: 0 });
  });

  it("si alguna falla → handleError llamado y error no nulo", async () => {
    viewService.getViewsByProperty.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useViewStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(handleErrorMock).toHaveBeenCalled();
    expect(result.current.error).not.toBeNull();
  });
});
