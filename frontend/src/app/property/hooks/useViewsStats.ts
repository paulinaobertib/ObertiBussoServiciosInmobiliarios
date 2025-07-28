import { useState, useEffect } from "react";
import * as viewService from "../services/view.service";
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

export const useViewStats = () => {
  const [stats, setStats] = useState<{
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [
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
        });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return { stats, loading, error };
};
