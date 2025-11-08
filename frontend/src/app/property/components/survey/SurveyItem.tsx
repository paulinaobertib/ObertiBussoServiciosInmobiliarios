import { Card, Box, Typography, Rating } from "@mui/material";

interface Props {
  score: number;
  comment: string;
}

export const SurveyItem = ({ score, comment }: Props) => (
  <Card variant="outlined" sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
    <Box display="flex" alignItems="center">
      <Rating name="read-only" value={score} precision={0.5} readOnly size="medium" sx={{ fontSize: 28 }} />
    </Box>
    <Typography variant="body2" color={comment ? "text.primary" : "text.secondary"}>
      {comment || "Sin comentario"}
    </Typography>
  </Card>
);
