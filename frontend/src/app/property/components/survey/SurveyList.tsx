import { Box } from '@mui/material';
import { SurveyItem } from './SurveyItem';

interface Survey {
  score: number;
  comment: string;
}

interface Props {
  surveys: Survey[];
}

export const SurveysList = ({ surveys }: Props) => (
  <Box display="flex" flexDirection="column" gap={2}>
    {surveys.length === 0
      ? <Box textAlign="center" color="text.secondary">No hay encuestas.</Box>
      : surveys.map((s, idx) => (
          <SurveyItem key={idx} score={s.score} comment={s.comment} />
        ))
    }
  </Box>
);
