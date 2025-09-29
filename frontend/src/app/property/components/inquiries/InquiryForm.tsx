import { Box, TextField, Stack } from "@mui/material";
import { useInquiryForm } from "../../hooks/useInquiryForm";
import { LoadingButton } from "@mui/lab";

interface Props {
  propertyIds?: number[];
}

export const InquiryForm = ({ propertyIds = [] }: Props) => {
  const { form, formLoading, handleChange, handleSubmit } = useInquiryForm({ propertyIds }); // siempre resetea al enviar

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
        <TextField label="Nombre" name="firstName" value={form.firstName} onChange={handleChange} fullWidth required />
        <TextField label="Apellido" name="lastName" value={form.lastName} onChange={handleChange} fullWidth required />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField label="Teléfono" name="phone" value={form.phone} onChange={handleChange} fullWidth required />
        <TextField
          label="Descripción de la consulta"
          name="description"
          value={form.description}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          required
        />

        <LoadingButton loading={formLoading} type="submit" variant="contained" disabled={formLoading} fullWidth>
          Enviar Consulta
        </LoadingButton>
      </Stack>
    </Box>
  );
};
