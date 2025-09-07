import { useState, useEffect } from "react";
import * as viewService from "../services/view.service";
import * as inquiryService from "../services/inquiry.service";
import * as surveyService from "../services/survey.service";

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
import { useApiErrors } from "../../shared/hooks/useErrors";

export const useViewStats = () => {
  const { handleError } = useApiErrors();

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
  }>({
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
    surveysCount: 0,
    averageSurveyScore: 0,
    surveyScoreDistribution: {},
    surveyDailyAverageScore: {},
    surveyMonthlyAverageScore: {},
    inquiryResponseTime: "",
    inquiryStatusDistribution: {},
    inquiriesByDayOfWeek: {},
    inquiriesByTimeRange: {},
    inquiriesPerMonth: {},
    mostConsultedProperties: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [
          // — VISTAS (11 llamadas) —
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
          // — ENCUESTAS (5 llamadas) —
          surveyList,
          avgSurveyScore,
          surveyScoreDistrib,
          surveyDailyAvg,
          surveyMonthlyAvg,
          // — CONSULTAS (6 llamadas) —
          resTimeResp,
          statusDistResp,
          byDayResp,
          byTimeResp,
          perMonthResp,
          mostPropsResp,
        ] = await Promise.all([
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
          surveyService.getAllSurveys(),
          surveyService.getAverageScore(),
          surveyService.getScoreDistribution(),
          surveyService.getDailyAverageScore(),
          surveyService.getMonthlyAverageScore(),
          inquiryService.getAverageInquiryResponseTime(),
          inquiryService.getInquiryStatusDistribution(),
          inquiryService.getInquiriesGroupedByDayOfWeek(),
          inquiryService.getInquiriesGroupedByTimeRange(),
          inquiryService.getInquiriesPerMonth(),
          inquiryService.getMostConsultedProperties(),
        ]);

        setStats({
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
          surveyScoreDistribution: surveyScoreDistrib,
          surveyDailyAverageScore: surveyDailyAvg,
          surveyMonthlyAverageScore: surveyMonthlyAvg,
          inquiryResponseTime: resTimeResp.data,
          inquiryStatusDistribution: statusDistResp.data,
          inquiriesByDayOfWeek: byDayResp.data,
          inquiriesByTimeRange: byTimeResp.data,
          inquiriesPerMonth: perMonthResp.data,
          mostConsultedProperties: mostPropsResp.data,
        });
      } catch (e) {
        handleError(e); // toast + mensaje legible
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { stats, loading, error };
};