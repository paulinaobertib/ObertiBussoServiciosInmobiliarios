import { useState } from "react";
import { SearchParams } from "../types/searchParams";
import { Property } from "../types/property";
import { usePropertyCrud } from "../context/PropertiesContext";
import { getPropertiesByFilters } from "../services/property.service";

export function useSearchFilters() {
  const { buildSearchParams } = usePropertyCrud();

  // Inicial defaults alineados con spec backend
  const [params, setParams] = useState<Partial<SearchParams>>({
    priceFrom: 0,
    priceTo: 0,
    areaFrom: 0,
    areaTo: 0,
    rooms: 0,
    operation: "",
    type: "",
    amenities: [],
    city: "",
    neighborhood: "",
    neighborhoodType: "" as any,
  });

  const apply = async (): Promise<Property[]> => {
    const searchParams = buildSearchParams(params);
    return await getPropertiesByFilters(searchParams as SearchParams);
  };

  return { params, setParams, apply };
}
