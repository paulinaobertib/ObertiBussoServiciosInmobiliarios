import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useAppointments } from "../../../hooks/useAppointments";
import { Calendar } from "../../Calendar";
import { useAuthContext } from "../../../context/AuthContext";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";
import { LoadingButton } from "@mui/lab";
import { EmptyState } from "../../../../shared/components/EmptyState";

export const AppointmentForm: React.FC = () => {
  const { info } = useAuthContext();
  const { showAlert } = useGlobalAlert();

  const {
    bookingDate,
    setBookingDate,
    bookingSlots,
    bookingSlotId,
    setBookingSlotId,
    bookingNotes,
    setBookingNotes,
    bookingLoading, // solo para el botón
    // bookingSubmitted,  // ya no se usa
    submitBooking,
    loadBookingSlots, // para refrescar horarios del día
  } = useAppointments();

  return (
    <Box
      component="form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!info) {
          showAlert("Debes iniciar sesión para solicitar un turno", "warning");
          return;
        }
        await submitBooking(); // hace la solicitud
        // Reiniciar formulario (sin pantalla intermedia)
        setBookingSlotId(null);
        setBookingNotes("");
        await loadBookingSlots(bookingDate); // refresca horarios por si cambió la disponibilidad
      }}
      sx={{
        display: "grid",
        gridTemplateAreas: {
          xs: `"cal" "slots" "notes"`,
          md: `"cal slots" "notes notes"`,
        },
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
        },
      }}
    >
      {/* CALENDARIO */}
      <Box gridArea="cal">
        <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
          Seleccioná un día
        </Typography>
        <Calendar initialDate={bookingDate} onSelectDate={(d) => setBookingDate(d)} />
      </Box>

      {/* SLOTS */}
      <Box gridArea="slots">
        <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
          Horarios disponibles
        </Typography>

        {bookingSlots.length === 0 ? (
          <EmptyState title="No hay turnos disponibles" description="Probá seleccionando otra fecha del calendario." />
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 1,
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              maxHeight: 310,
              overflowY: "auto",
            }}
          >
            {bookingSlots.map((slot) => {
              const time = slot.date.slice(11, 16);
              const selected = bookingSlotId === slot.id;
              return (
                <Button
                  key={slot.id}
                  variant={selected ? "contained" : "outlined"}
                  size="small"
                  fullWidth
                  sx={{ py: 0.5 }}
                  onClick={() => slot.availability && setBookingSlotId(slot.id)}
                  disabled={!slot.availability}
                >
                  {time}
                </Button>
              );
            })}
          </Box>
        )}
      </Box>

      {/* NOTAS + SUBMIT */}
      <Box gridArea="notes" sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle1" align="center" sx={{ mt: 0 }}>
          Comentarios
        </Typography>
        <TextField
          label="Comentarios adicionales"
          value={bookingNotes}
          onChange={(e) => setBookingNotes(e.target.value)}
          multiline
          rows={3}
          fullWidth
          sx={{ mb: 2 }}
        />
        <LoadingButton
          type="submit"
          variant="contained"
          disabled={bookingSlotId === null || bookingLoading}
          fullWidth
          loading={bookingLoading} // único lugar con spinner
        >
          Solicitar Turno
        </LoadingButton>
      </Box>
    </Box>
  );
};
