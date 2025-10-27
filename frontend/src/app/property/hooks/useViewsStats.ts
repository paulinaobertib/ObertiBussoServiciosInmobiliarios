import { useState, useEffect } from "react";
import * as viewService from "../services/view.service";
import * as inquiryService from "../services/inquiry.service";
import * as surveyService from "../services/survey.service";
import { useContractStats } from "../../user/hooks/contracts/useContractStats";
import { useApiErrors } from "../../shared/hooks/useErrors";

// —— COMISIONES
import * as commissionService from "../../user/services/commission.service";
import { Commission, CommissionStatus, CommissionPaymentType } from "../../user/types/commission";
import { PaymentCurrency, PaymentConcept, Payment } from "../../user/types/payment";

// —— PAYMENTS
import * as paymentService from "../../user/services/payment.service";

import {
  ViewsByProperty,
  ViewsByPropertyType,
  ViewsByDay,
  ViewsByMonth,
  ViewsByNeighborhood,
  ViewsByNeighborhoodType,
  ViewsByStatus,
  ViewsByStatusAndType,
  ViewsByOperation,
  ViewsByRooms,
  ViewsByAmenity,
} from "../types/view";

type CommissionOptions = {
  currency?: PaymentCurrency;
  year?: number;
  from?: string;
  to?: string;
  includeLists?: boolean;
};

type PaymentsOptions = {
  currency?: PaymentCurrency; // para calcular totales filtrados por moneda en el rango
  from?: string;
  to?: string;
};

type UseViewStatsOptions = {
  commissions?: CommissionOptions;
  payments?: PaymentsOptions;
};

function monthKey(isoDate: string) {
  // isoDate "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm..."
  return (isoDate ?? "").slice(0, 7); // YYYY-MM
}

function isWithinRange(dateIso: string | undefined, from: string, to: string) {
  if (!dateIso) return false;
  const dateOnly = dateIso.slice(0, 10);
  return (!from || dateOnly >= from) && (!to || dateOnly <= to);
}

export const useViewStats = (options?: UseViewStatsOptions) => {
  const { handleError } = useApiErrors();
  const { getCountByStatus, getCountByType } = useContractStats();

  // —— Defaults generales
  const today = new Date();
  const yyyy = today.getFullYear();
  const defaultFrom = new Date(yyyy, today.getMonth(), 1).toISOString().slice(0, 10);
  const defaultTo = new Date().toISOString().slice(0, 10);

  const commissionCfg: Required<CommissionOptions> = {
    currency: options?.commissions?.currency ?? PaymentCurrency.ARS,
    year: options?.commissions?.year ?? yyyy,
    from: options?.commissions?.from ?? defaultFrom,
    to: options?.commissions?.to ?? defaultTo,
    includeLists: options?.commissions?.includeLists ?? false,
  };

  const paymentsCfg: Required<PaymentsOptions> = {
    currency: options?.payments?.currency ?? PaymentCurrency.ARS,
    from: options?.payments?.from ?? defaultFrom,
    to: options?.payments?.to ?? defaultTo,
  };

  const [stats, setStats] = useState<{
    // — VISTAS —
    property: ViewsByProperty;
    propertyType: ViewsByPropertyType;
    day: ViewsByDay;
    month: ViewsByMonth;
    neighborhood: ViewsByNeighborhood;
    neighborhoodType: ViewsByNeighborhoodType;
    status: ViewsByStatus;
    statusAndType: ViewsByStatusAndType;
    operation: ViewsByOperation;
    rooms: ViewsByRooms;
    amenity: ViewsByAmenity;
    // — ENCUESTAS —
    surveysCount: number;
    averageSurveyScore: number;
    surveyScoreDistribution: Record<number, number>;
    surveyDailyAverageScore: Record<string, number>;
    surveyMonthlyAverageScore: Record<string, number>;
    // — CONSULTAS —
    inquiryResponseTime: string;
    inquiryStatusDistribution: Record<string, number>;
    inquiriesByDayOfWeek: Record<string, number>;
    inquiriesByTimeRange: Record<string, number>;
    inquiriesPerMonth: Record<string, number>;
    mostConsultedProperties: Record<string, number>;
    // - CONTRATOS -
    contractStatus: Record<string, number>;
    contractType: Record<string, number>;
    // - COMISIONES -
    commissionsCountByStatus: Record<CommissionStatus, number>;
    commissionsCountByPaymentType: Record<CommissionPaymentType, number>;
    commissionsTotalByStatus: Record<CommissionStatus, number>;
    commissionsTotalInDateRange: number;
    commissionsYearMonthlyTotals: Record<string, number>;
    commissionsByStatus?: Record<CommissionStatus, Commission[]>;
    commissionsByPaymentTypeList?: Record<CommissionPaymentType, Commission[]>;
    // - PAYMENTS -
    paymentsTotalInDateRange: number; // suma de amount del rango, filtrado por paymentsCfg.currency
    paymentsCountByConcept: Record<PaymentConcept | string, number>;
    paymentsCountByCurrency: Record<PaymentCurrency, number>;
    paymentsMonthlyTotals: Record<string, number>; // YYYY-MM -> total (en currency del pago)
    paymentsByContractRangeCount: number;
    paymentsByCommissionRangeCount: number;
    paymentsByUtilityRangeCount: number;
  }>({
    // — VISTAS —
    property: {},
    propertyType: {},
    day: {},
    month: {},
    neighborhood: {},
    neighborhoodType: {},
    status: {},
    statusAndType: {},
    operation: {},
    rooms: {},
    amenity: {},
    // — ENCUESTAS —
    surveysCount: 0,
    averageSurveyScore: 0,
    surveyScoreDistribution: {},
    surveyDailyAverageScore: {},
    surveyMonthlyAverageScore: {},
    // — CONSULTAS —
    inquiryResponseTime: "",
    inquiryStatusDistribution: {},
    inquiriesByDayOfWeek: {},
    inquiriesByTimeRange: {},
    inquiriesPerMonth: {},
    mostConsultedProperties: {},
    // — CONTRATOS —
    contractStatus: {},
    contractType: {},
    // — COMISIONES —
    commissionsCountByStatus: { PAGADA: 0, PARCIAL: 0, PENDIENTE: 0 },
    commissionsCountByPaymentType: { COMPLETO: 0, CUOTAS: 0 },
    commissionsTotalByStatus: { PAGADA: 0, PARCIAL: 0, PENDIENTE: 0 },
    commissionsTotalInDateRange: 0,
    commissionsYearMonthlyTotals: {},
    // — PAYMENTS —
    paymentsTotalInDateRange: 0,
    paymentsCountByConcept: {},
    paymentsCountByCurrency: { ARS: 0, USD: 0 },
    paymentsMonthlyTotals: {},
    paymentsByContractRangeCount: 0,
    paymentsByCommissionRangeCount: 0,
    paymentsByUtilityRangeCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        // ====== Batch principal (todo lo “duro”) ======
        const [
          // — VISTAS —
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
          // — ENCUESTAS —
          surveyList,
          avgSurveyScore,
          surveyScoreDistrib,
          surveyDailyAvg,
          surveyMonthlyAvg,
          // — CONSULTAS —
          resTimeResp,
          statusDistResp,
          byDayResp,
          byTimeResp,
          perMonthResp,
          mostPropsResp,
          // — CONTRATOS —
          contractStatusMap,
          contractTypeMap,
          // — COMISIONES — totales / conteos
          commissionsCountByStatusResp,
          totalPagadas,
          totalParcial,
          totalPendiente,
          totalInRange,
          yearMonthlyTotals,
          // — PAYMENTS — base por rango de fechas
          allPayments,
        ] = await Promise.all([
          // VIEWS
          viewService.getViewsByProperty(),
          viewService.getViewsByPropertyType(),
          viewService.getViewsByDay(),
          viewService.getViewsByMonth(),
          viewService.getViewsByNeighborhood(),
          viewService.getViewsByNeighborhoodType(),
          viewService.getViewsByStatus(),
          viewService.getViewsByStatusAndType(),
          viewService.getViewsByOperation(),
          viewService.getViewsByRooms(),
          viewService.getViewsByAmenity(),
          // SURVEYS
          surveyService.getAllSurveys(),
          surveyService.getAverageScore(),
          surveyService.getScoreDistribution(),
          surveyService.getDailyAverageScore(),
          surveyService.getMonthlyAverageScore(),
          // INQUIRIES
          inquiryService.getAverageInquiryResponseTime(),
          inquiryService.getInquiryStatusDistribution(),
          inquiryService.getInquiriesGroupedByDayOfWeek(),
          inquiryService.getInquiriesGroupedByTimeRange(),
          inquiryService.getInquiriesPerMonth(),
          inquiryService.getMostConsultedProperties(),
          // CONTRACTS
          getCountByStatus(),
          getCountByType(),
          // COMMISSIONS — conteos / totales
          commissionService.countCommissionsByStatus(),
          commissionService.getTotalAmountByStatus(CommissionStatus.PAGADA, commissionCfg.currency),
          commissionService.getTotalAmountByStatus(CommissionStatus.PARCIAL, commissionCfg.currency),
          commissionService.getTotalAmountByStatus(CommissionStatus.PENDIENTE, commissionCfg.currency),
          commissionService.getDateTotals(commissionCfg.from, commissionCfg.to, commissionCfg.currency),
          commissionService.getYearMonthlyTotals(commissionCfg.year, commissionCfg.currency),
          // PAYMENTS — usar endpoint de rango con fechas amplias (1 año hacia atrás)
          paymentService.getPaymentsByDateRange(
            new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0, 10),
            new Date().toISOString().slice(0, 10)
          ),
        ]);
        const paymentsInRange = (allPayments as Payment[]).filter((p) =>
          isWithinRange(p?.date, paymentsCfg.from, paymentsCfg.to)
        );

        const totalCommissionsCount = Object.values(commissionsCountByStatusResp).reduce((acc, v) => acc + Number(v ?? 0), 0);

        // ====== Batch tolerante para comisiones (paymentType + listas por estado) ======
        const commissionsSettled = await Promise.allSettled([
          commissionService.getCommissionsByPaymentType(CommissionPaymentType.COMPLETO),
          commissionCfg.includeLists
            ? commissionService.getCommissionsByStatus(CommissionStatus.PAGADA)
            : Promise.resolve([] as Commission[]),
          commissionCfg.includeLists
            ? commissionService.getCommissionsByStatus(CommissionStatus.PARCIAL)
            : Promise.resolve([] as Commission[]),
          commissionCfg.includeLists
            ? commissionService.getCommissionsByStatus(CommissionStatus.PENDIENTE)
            : Promise.resolve([] as Commission[]),
        ]);

        const safeAt = <T>(arr: PromiseSettledResult<unknown>[], i: number, fallback: T): T =>
          arr[i]?.status === "fulfilled" ? (arr[i] as PromiseFulfilledResult<T>).value : fallback;

        const listCompleto = safeAt<Commission[]>(commissionsSettled, 0, []);
        const listPagadas = safeAt<Commission[]>(commissionsSettled, 1, []);
        const listParcial = safeAt<Commission[]>(commissionsSettled, 2, []);
        const listPendiente = safeAt<Commission[]>(commissionsSettled, 3, []);

        const cuotasCount = Math.max(totalCommissionsCount - listCompleto.length, 0);

        const commissionsCountByPaymentType = {
          COMPLETO: listCompleto.length,
          CUOTAS: cuotasCount,
        } as Record<CommissionPaymentType, number>;

        const commissionsByPaymentTypeList = commissionCfg.includeLists
          ? { COMPLETO: listCompleto, CUOTAS: [] as Commission[] }
          : undefined;

        const commissionsTotalByStatus = {
          PAGADA: totalPagadas,
          PARCIAL: totalParcial,
          PENDIENTE: totalPendiente,
        } as Record<CommissionStatus, number>;

        // ====== Batch tolerante para payments (currency + sub-rangos) ======
        const paymentsContractRange = paymentsInRange.filter(
          (p) => !p.commissionId && !p.contractUtilityId
        );
        const paymentsCommissionRange = paymentsInRange.filter((p) => Boolean(p.commissionId));
        const paymentsUtilityRange = paymentsInRange.filter((p) => Boolean(p.contractUtilityId));

        // === KPIs de payments derivados ===
        // Total en el rango principal, filtrado por la moneda elegida en options.payments.currency
        const paymentsTotalInDateRange = paymentsInRange
          .filter((p) => p.paymentCurrency === paymentsCfg.currency)
          .reduce((acc, p) => acc + Number(p.amount || 0), 0);

        // Conteo por concepto (ALQUILER, EXTRA, COMISION) dentro del rango principal
        const paymentsCountByConcept = paymentsInRange.reduce<Record<string, number>>((acc, p) => {
          const k = p.concept ?? "UNKNOWN";
          acc[k] = (acc[k] ?? 0) + 1;
          return acc;
        }, {});

        // Conteo por moneda (derivando de paymentsInRange)
        const paymentsCountByCurrency = paymentsInRange.reduce<Record<PaymentCurrency, number>>((acc, p) => {
          const curr = p.paymentCurrency;
          if (curr === PaymentCurrency.ARS || curr === PaymentCurrency.USD) {
            acc[curr] = (acc[curr] ?? 0) + 1;
          }
          return acc;
        }, { ARS: 0, USD: 0 });

        // Totales mensuales (sumando montos según currency del propio pago)
        const paymentsMonthlyTotals = paymentsInRange.reduce<Record<string, number>>((acc, p) => {
          const key = monthKey(p.date);
          acc[key] = (acc[key] ?? 0) + Number(p.amount || 0);
          return acc;
        }, {});

        const next = {
          // — VISTAS —
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
          // — ENCUESTAS —
          surveysCount: surveyList.length,
          averageSurveyScore: avgSurveyScore,
          surveyScoreDistribution: surveyScoreDistrib,
          surveyDailyAverageScore: surveyDailyAvg,
          surveyMonthlyAverageScore: surveyMonthlyAvg,
          // — CONSULTAS —
          inquiryResponseTime: resTimeResp.data,
          inquiryStatusDistribution: statusDistResp.data,
          inquiriesByDayOfWeek: byDayResp.data,
          inquiriesByTimeRange: byTimeResp.data,
          inquiriesPerMonth: perMonthResp.data,
          mostConsultedProperties: mostPropsResp.data,
          // — CONTRATOS —
          contractStatus: contractStatusMap,
          contractType: contractTypeMap,
          // — COMISIONES —
          commissionsCountByStatus: commissionsCountByStatusResp,
          commissionsCountByPaymentType,
          commissionsTotalByStatus,
          commissionsTotalInDateRange: totalInRange,
          commissionsYearMonthlyTotals: yearMonthlyTotals,
          ...(commissionCfg.includeLists && {
            commissionsByStatus: { PAGADA: listPagadas, PARCIAL: listParcial, PENDIENTE: listPendiente },
            commissionsByPaymentTypeList,
          }),
          // — PAYMENTS —
          paymentsTotalInDateRange,
          paymentsCountByConcept,
          paymentsCountByCurrency,
          paymentsMonthlyTotals,
          paymentsByContractRangeCount: paymentsContractRange.length,
          paymentsByCommissionRangeCount: paymentsCommissionRange.length,
          paymentsByUtilityRangeCount: paymentsUtilityRange.length,
        };

        setStats((prev) => ({ ...prev, ...next }));
      } catch (e) {
        handleError(e);
        setError((e as Error)?.message ?? "Error al cargar estadísticas");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Recompute si cambian opciones
    // Comisiones
    commissionCfg.currency,
    commissionCfg.year,
    commissionCfg.from,
    commissionCfg.to,
    commissionCfg.includeLists,
    // Payments
    paymentsCfg.currency,
    paymentsCfg.from,
    paymentsCfg.to,
  ]);

  return { stats, loading, error };
};
