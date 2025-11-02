import { Box, Card, CardContent, Typography, Chip, Stack, CircularProgress } from "@mui/material";
import { useSuggestions } from "../../hooks/useSuggestions";
import { EmptyState } from "../../../shared/components/EmptyState";

export const SuggestionsSection = () => {
  const { suggestions, loading } = useSuggestions();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Ordenar sugerencias de la más reciente a la más antigua
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (loading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Box sx={{ py: { xs: 2, sm: 3 }, flexGrow: 1 }}>
        <EmptyState
          title="No hay sugerencias registradas"
          description="Aún no se han recibido sugerencias de los usuarios. Cuando lleguen nuevas sugerencias, las verás aquí."
        />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Stack spacing={2}>
        {sortedSuggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardContent>
              <Stack spacing={2}>
                {/* Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Chip label={`Sugerencia #${suggestion.id}`} size="small" color="primary" variant="outlined" />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(suggestion.date)}
                  </Typography>
                </Box>

                {/* Description */}
                <Typography
                  variant="body1"
                  color="text.primary"
                  sx={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: 1.6,
                    fontSize: "0.9rem",
                  }}
                >
                  {suggestion.description}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
