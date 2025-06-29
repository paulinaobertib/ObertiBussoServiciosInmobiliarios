import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useAuthContext } from "../../../user/context/AuthContext";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { postInquiry } from "../../services/inquiry.service";
import type {
  InquiryCreateAuth,
  InquiryCreateAnon,
} from "../../types/inquiry";

interface Props {
  propertyIds: number[];
  onDone: () => void;
}

export const InquiryForm = ({ propertyIds, onDone }: Props) => {
  const { info, isLogged } = useAuthContext();
  const { showAlert } = useGlobalAlert();

  const [form, setForm] = useState({
    firstName: info?.firstName ?? "",
    lastName: info?.lastName ?? "",
    email: info?.email ?? "",
    phone: info?.phone ?? "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const title = `Consulta${isLogged && info?.email ? ` (${info.email})` : ""}`;

    const basePayload: {
      title: string;
      description: string;
      propertyIds?: number[];
    } = {
      title,
      description: form.description,
      ...(propertyIds?.length ? { propertyIds } : {}),
    };

    try {
      if (isLogged && info) {
        const payload: InquiryCreateAuth = {
          userId: info.id,
          ...basePayload,
        };
        await postInquiry(payload);
      } else {
        const payload: InquiryCreateAnon = {
          ...basePayload,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
        };
        await postInquiry(payload);
      }

      showAlert("Consulta enviada con éxito", "success");
      onDone();
      setForm((prev) => ({ ...prev, description: "" }));
    } catch (err: any) {
      console.error("Error al enviar consulta:", err);
      const status = err.response?.status;
      const data = err.response?.data;
      showAlert(
        status
          ? `Error ${status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`
          : err.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {!isLogged && (
          <>
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
          </>
        )}
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

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          fullWidth
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : undefined
          }
          sx={{ mt: 'auto' }}
        >
          Enviar Consulta
        </Button>
      </Stack>
    </Box>
  );
}
