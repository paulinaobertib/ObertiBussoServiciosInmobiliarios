import { useState, useEffect } from "react";
import { getAllSuggestions } from "../services/suggestion.service";
import { Suggestion } from "../types/suggestion";
import { useApiErrors } from "../../shared/hooks/useErrors";

export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useApiErrors();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const data = await getAllSuggestions();
        setSuggestions(data);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [handleError]);

  return {
    suggestions,
    loading,
  };
};
