import {
  Box, TextField, Button, Stack,
  CircularProgress, Typography,
} from '@mui/material';
import { useInquiryForm } from '../../hooks/useInquiryForm';

interface Props {
  propertyIds?: number[];
}

export const InquiryForm = ({ propertyIds = [] }: Props) => {
  const {
    form,
    formLoading,
    formError,
    submitted,
    handleChange,
    handleSubmit,
  } = useInquiryForm({ propertyIds });

  if (submitted) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          p: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          ¡Consulta enviada!
        </Typography>
        <Typography>
          Gracias. Te avisaremos en cuanto tengamos una respuesta.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <TextField
          label="Nombre"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Apellido"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Teléfono"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          fullWidth
          required
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
        />

        {formError && (
          <Typography color="error" align="center">
            {formError}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={formLoading}
          fullWidth
          startIcon={
            formLoading
              ? <CircularProgress size={20} color="inherit" />
              : undefined
          }
          sx={{ mt: 'auto' }}
        >
          {formLoading ? 'Enviando…' : 'Enviar Consulta'}
        </Button>
      </Stack>
    </Box>
  );
};
