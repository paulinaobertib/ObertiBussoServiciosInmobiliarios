import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { EmptyState } from "../../../shared/components/EmptyState";
import { getAllSurveys } from "../../services/survey.service";
import { SurveysList } from "./SurveyList";

interface Survey {
  id?: number;
  score: number;
  comment: string;
}

export const SurveysSection = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAllSurveys()
      .then((data) => {
        const sorted = [...data].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        setSurveys(sorted);
      })
      .catch(() => setError("No se pudieron cargar las encuestas"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px" mt={2}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <EmptyState title="No pudimos cargar las valoraciones." tone="error" />
      </Box>
    );
  }

  return (
    <Box mt={2}>
      <SurveysList surveys={surveys} />
    </Box>
  );
};
