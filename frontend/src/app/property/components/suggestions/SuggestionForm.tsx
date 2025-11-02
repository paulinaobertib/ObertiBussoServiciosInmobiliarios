import { Box, TextField, Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSuggestionForm } from "../../hooks/useSuggestionForm";

interface Props {
  onSuccess?: () => void;
}

export const SuggestionForm = ({ onSuccess }: Props) => {
  const { form, formLoading, handleChange, handleSubmit } = useSuggestionForm({ onSuccess });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack spacing={2} sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        <TextField
          name="description"
          value={form.description}
          onChange={handleChange}
          multiline
          rows={6}
          fullWidth
          required
        />

        <LoadingButton loading={formLoading} type="submit" variant="contained" disabled={formLoading} fullWidth>
          Enviar Sugerencia de Mejora
        </LoadingButton>
      </Stack>
    </Box>
  );
};
