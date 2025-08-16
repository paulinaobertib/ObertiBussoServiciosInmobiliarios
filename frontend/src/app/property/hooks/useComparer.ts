import { useState } from "react";
import { comparerProperty } from "../services/comparer.service";
import { PropertyDTOAI } from "../types/property";
import { useApiErrors } from "../../shared/hooks/useErrors";

export const useComparerProperty = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { handleError } = useApiErrors();

  const compare = async (data: PropertyDTOAI[]) => {
    setLoading(true);

    try {
      const response = await comparerProperty(data);
      setResult(response);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  return { compare, loading, result };
};
