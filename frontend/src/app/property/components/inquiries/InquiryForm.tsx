import { Box, TextField, Stack } from "@mui/material";
import { useInquiryForm } from "../../hooks/useInquiryForm";
import { LoadingButton } from "@mui/lab";

interface Props {
  propertyIds?: number[];
}

export const InquiryForm = ({ propertyIds = [] }: Props) => {
  const { form, formLoading, handleChange, handleSubmit } = useInquiryForm({ propertyIds }); // siempre resetea al enviar
  const fieldSx = {
    "& .MuiInputBase-input": {
      fontSize: { xs: "0.95rem", md: "0.90rem" },
    },
    "& .MuiInputLabel-root": {
      fontSize: { xs: "0.95rem", md: "0.90rem" },
    },
  };

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
      <Stack spacing={2} sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 1 } }}>
        <TextField
          label="Nombre"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          fullWidth
          required
          size="small"
          sx={fieldSx}
        />
        <TextField
          label="Apellido"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          fullWidth
          required
          size="small"
          sx={fieldSx}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          required
          size="small"
          sx={fieldSx}
        />
        <TextField
          label="Teléfono"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          fullWidth
          required
          size="small"
          sx={fieldSx}
        />
        <TextField
          label="Descripción de la consulta"
          name="description"
          value={form.description}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          required
          size="small"
          InputProps={{ sx: { alignItems: "flex-start" } }}
          sx={fieldSx}
        />

        <LoadingButton
          loading={formLoading}
          type="submit"
          variant="contained"
          disabled={formLoading}
          fullWidth
          size="small"
          sx={{ fontSize: { xs: "0.95rem", md: "0.85rem" } }}
        >
          Enviar Consulta
        </LoadingButton>
      </Stack>
    </Box>
  );
};
