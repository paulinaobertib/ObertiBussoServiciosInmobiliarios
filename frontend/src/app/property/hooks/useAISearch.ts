import { KeyboardEvent, useCallback, useState } from "react";
import { usePropertiesContext } from "../context/PropertiesContext";
import { Property } from "../types/property";
import { PropertySimple } from "../types/property";
import { searchPropertiesWithAI } from "../services/ai-search.service";
import { getPropertyById } from "../services/property.service";

interface UseAISearchOptions {
  onResults: (results: Property[] | null) => void;
}

export const useAISearch = ({ onResults }: UseAISearchOptions) => {
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { propertiesList, setPropertiesLoading } = usePropertiesContext();

  const resolveFullProperties = useCallback(
    async (raw: PropertySimple[]): Promise<Property[]> => {
      const localMap = new Map((propertiesList ?? []).map((property) => [property.id, property]));
      const missingIds = raw.map((item) => item.id).filter((id) => !localMap.has(id));

      let fetched: Property[] = [];
      if (missingIds.length) {
        const promises = missingIds.map(async (id) => {
          try {
            return await getPropertyById(id);
          } catch (fetchError) {
            console.error(`Error fetching property ${id} from AI result`, fetchError);
            return null;
          }
        });
        fetched = (await Promise.all(promises)).filter(Boolean) as Property[];
      }

      const fetchedMap = new Map(fetched.map((property) => [property.id, property]));

      return raw
        .map((item) => localMap.get(item.id) ?? fetchedMap.get(item.id))
        .filter((property): property is Property => Boolean(property));
    },
    [propertiesList]
  );

  const handleAISearch = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Describe lo que estás buscando para usar la búsqueda con IA.");
      return;
    }

    setError(null);
    setLoading(true);
    setPropertiesLoading(true);
    try {
      const rawResults = await searchPropertiesWithAI(trimmed);

      if (!rawResults.length) {
        onResults([]);
        return;
      }

      const resolved = await resolveFullProperties(rawResults);
      onResults(resolved.length ? resolved : []);
    } catch (aiError) {
      console.error("AI search failed:", aiError);
      setError("No pudimos completar la búsqueda con IA. Intentá nuevamente.");
      onResults([]);
    } finally {
      setLoading(false);
      setPropertiesLoading(false);
    }
  }, [prompt, onResults, resolveFullProperties, setPropertiesLoading]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleAISearch();
      }
    },
    [handleAISearch]
  );

  const enableAI = useCallback(() => setIsAIEnabled(true), []);
  const disableAI = useCallback(() => {
    setIsAIEnabled(false);
    setPrompt("");
    setError(null);
  }, []);

  return {
    isAIEnabled,
    enableAI,
    disableAI,
    prompt,
    setPrompt,
    loading,
    error,
    handleAISearch,
    handleKeyDown,
  };
};
