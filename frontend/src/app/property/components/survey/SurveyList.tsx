import { Box } from "@mui/material";
import { SurveyItem } from "./SurveyItem";
import { EmptyState } from "../../../shared/components/EmptyState";

interface Survey {
  score: number;
  comment: string;
}

interface Props {
  surveys: Survey[];
}

export const SurveysList = ({ surveys }: Props) => {
  if (surveys.length === 0) {
    return (
      <Box>
        <EmptyState title="No hay valoraciones disponibles." />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {surveys.map((s, idx) => (
        <SurveyItem key={idx} score={s.score} comment={s.comment} />
      ))}
    </Box>
  );
};
