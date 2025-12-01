/// <reference types="vitest" />
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { PaymentCurrency, PaymentConcept } from "../../../user/types/payment";

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
  getPartialCommissionsRemainingAmount: vi.fn().mockResolvedValue(0),
  getCommissionsByPaymentType: vi.fn().mockResolvedValue([]),
  getCommissionsByStatus: vi.fn().mockResolvedValue([]),
}));

// payments
vi.mock("../../../user/services/payment.service", () => ({
  getPaymentsByDateRange: vi.fn().mockResolvedValue([]),
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
let commissionService: any;
let paymentService: any;

beforeAll(async () => {
  viewService = await import("../../services/view.service");
  surveyService = await import("../../services/survey.service");
  inquiryService = await import("../../services/inquiry.service");
  commissionService = await import("../../../user/services/commission.service");
  paymentService = await import("../../../user/services/payment.service");
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

  it("respeta opciones: filtra por moneda, agrega listas y maneja fallbacks", async () => {
    viewService.getViewsByProperty.mockResolvedValueOnce({});
    viewService.getViewsByPropertyType.mockResolvedValueOnce({});
    viewService.getViewsByDay.mockResolvedValueOnce({});
    viewService.getViewsByMonth.mockResolvedValueOnce({});
    viewService.getViewsByNeighborhood.mockResolvedValueOnce({});
    viewService.getViewsByNeighborhoodType.mockResolvedValueOnce({});
    viewService.getViewsByStatus.mockResolvedValueOnce({});
    viewService.getViewsByStatusAndType.mockResolvedValueOnce({});
    viewService.getViewsByOperation.mockResolvedValueOnce({});
    viewService.getViewsByRooms.mockResolvedValueOnce({});
    viewService.getViewsByAmenity.mockResolvedValueOnce({});

    surveyService.getAllSurveys.mockResolvedValueOnce([]);
    surveyService.getAverageScore.mockResolvedValueOnce(0);
    surveyService.getScoreDistribution.mockResolvedValueOnce({});
    surveyService.getDailyAverageScore.mockResolvedValueOnce({});
    surveyService.getMonthlyAverageScore.mockResolvedValueOnce({});

    inquiryService.getAverageInquiryResponseTime.mockResolvedValueOnce({ data: "00:00:00" });
    inquiryService.getInquiryStatusDistribution.mockResolvedValueOnce({ data: {} });
    inquiryService.getInquiriesGroupedByDayOfWeek.mockResolvedValueOnce({ data: {} });
    inquiryService.getInquiriesGroupedByTimeRange.mockResolvedValueOnce({ data: {} });
    inquiryService.getInquiriesPerMonth.mockResolvedValueOnce({ data: {} });
    inquiryService.getMostConsultedProperties.mockResolvedValueOnce({ data: {} });

    commissionService.countCommissionsByStatus.mockResolvedValueOnce({ PAGADA: 1, PARCIAL: 0, PENDIENTE: 0 });
    commissionService.getTotalAmountByStatus.mockResolvedValueOnce(100); // PAGADA
    commissionService.getTotalAmountByStatus.mockResolvedValueOnce(50); // PARCIAL
    commissionService.getTotalAmountByStatus.mockResolvedValueOnce(25); // PENDIENTE
    commissionService.getDateTotals.mockResolvedValueOnce(175);
    commissionService.getYearMonthlyTotals.mockResolvedValueOnce({ "2024-02": 80 });
    commissionService.getPartialCommissionsRemainingAmount.mockResolvedValueOnce(75);

    commissionService.getCommissionsByPaymentType.mockResolvedValueOnce([{ id: "c-completo" } as any]);
    commissionService.getCommissionsByStatus.mockResolvedValueOnce([{ id: "s-pag" } as any]);
    commissionService.getCommissionsByStatus.mockResolvedValueOnce([{ id: "s-par" } as any]);
    commissionService.getCommissionsByStatus.mockResolvedValueOnce([{ id: "s-pen" } as any]);

    const paymentsFixture = [
      {
        paymentCurrency: PaymentCurrency.USD,
        amount: 200,
        concept: PaymentConcept.ALQUILER,
        date: "2024-02-10",
        contractId: 1,
        commissionId: null,
        contractUtilityId: null,
      },
      {
        paymentCurrency: PaymentCurrency.ARS,
        amount: 150,
        concept: PaymentConcept.EXTRA,
        date: "2024-02-18",
        contractId: 1,
        commissionId: null,
        contractUtilityId: 99,
      },
      {
        paymentCurrency: PaymentCurrency.USD,
        amount: 50,
        concept: PaymentConcept.COMISION,
        date: "2024-03-05",
        contractId: 1,
        commissionId: 77,
        contractUtilityId: null,
      },
      {
        paymentCurrency: PaymentCurrency.USD,
        amount: 999,
        concept: PaymentConcept.EXTRA,
        date: "2023-12-01",
        contractId: 2,
        commissionId: null,
        contractUtilityId: null,
      },
    ];
    paymentService.getPaymentsByDateRange.mockResolvedValueOnce(paymentsFixture);

    const { result } = renderHook(() =>
      useViewStats({
        commissions: {
          includeLists: true,
          currency: PaymentCurrency.USD,
          from: "2024-02-01",
          to: "2024-03-31",
          year: 2024,
        },
        payments: {
          currency: PaymentCurrency.USD,
          from: "2024-02-01",
          to: "2024-03-31",
        },
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.paymentsTotalInDateRange).toBe(250);
    expect(result.current.stats.paymentsCountByConcept).toEqual({
      [PaymentConcept.ALQUILER]: 1,
      [PaymentConcept.EXTRA]: 1,
      [PaymentConcept.COMISION]: 1,
    });
    expect(result.current.stats.paymentsMonthlyTotals).toEqual({ "2024-02": 350, "2024-03": 50 });
    expect(result.current.stats.paymentsCountByCurrency).toEqual({ ARS: 1, USD: 2 });
    expect(result.current.stats.paymentsByContractRangeCount).toBe(1);
    expect(result.current.stats.paymentsByCommissionRangeCount).toBe(1);
    expect(result.current.stats.paymentsByUtilityRangeCount).toBe(1);

    expect(result.current.stats.commissionsCountByPaymentType).toEqual({ COMPLETO: 1, CUOTAS: 0 });
    expect(result.current.stats.commissionsTotalByStatus).toEqual({ PAGADA: 100, PARCIAL: 50, PENDIENTE: 25 });
    expect(result.current.stats.commissionsByStatus?.PAGADA).toHaveLength(1);
    expect(result.current.stats.commissionsByPaymentTypeList?.COMPLETO).toHaveLength(1);
    expect(result.current.stats.commissionsByPaymentTypeList?.CUOTAS).toHaveLength(0);
    expect(result.current.stats.partialCommissionsRemainingAmount).toBe(75);
  });
});
