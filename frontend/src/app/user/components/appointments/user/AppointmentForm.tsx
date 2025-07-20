import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useAppointments } from '../../../hooks/useAppoitments';
import { Calendar } from '../../Calendar';

export const AppointmentForm = () => {
    const {
        bookingDate,
        setBookingDate,
        bookingSlots,
        bookingSlotId,
        setBookingSlotId,
        bookingNotes,
        setBookingNotes,
        bookingLoading,
        bookingError,
        bookingSubmitted,
        submitBooking,
    } = useAppointments();

    if (bookingSubmitted) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    mx: 2,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    ¡Turno solicitado con éxito!
                </Typography>
                <Typography>Te avisaremos cuando sea aceptado.</Typography>
            </Box>
        );
    }

    return (
        <Box
            component="form"
            onSubmit={(e) => {
                e.preventDefault();
                submitBooking();
            }}
            sx={{
                display: 'grid',
                gridTemplateAreas: {
                    xs: `"cal" "slots" "notes"`,
                    md: `"cal slots" "notes notes"`,
                },
                gridTemplateColumns: {
                    xs: '1fr',
                    md: '1fr 1fr',
                },
            }}
        >
            {/* CALENDARIO */}
            <Box gridArea="cal">
                <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
                    Seleccioná un día
                </Typography>
                <Calendar
                    initialDate={bookingDate}
                    onSelectDate={(d) => setBookingDate(d)}
                />
            </Box>

            {/* SLOTS */}
            <Box
                gridArea="slots"
                sx={{
                    // limitar altura y habilitar scroll si hay muchos horarios
                }}
            >
                <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
                    Horarios disponibles
                </Typography>
                {bookingLoading ? (
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : bookingSlots.length === 0 ? (
                    <Typography color="text.secondary" align="center">
                        No hay turnos.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 1,
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            maxHeight: 310,
                            overflowY: 'auto',
                        }}
                    >
                        {bookingSlots.map((slot) => {
                            const time = slot.date.slice(11, 16);
                            const selected = bookingSlotId === slot.id;
                            return (
                                <Button
                                    key={slot.id}
                                    variant={selected ? 'contained' : 'outlined'}
                                    size="small"
                                    fullWidth
                                    // botones más compactos
                                    sx={{ py: 0.5, minHeight: 24, fontSize: '0.75rem' }}
                                    onClick={() =>
                                        slot.availability && setBookingSlotId(slot.id)
                                    }
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
            <Box
                gridArea="notes"
                sx={{ display: 'flex', flexDirection: 'column' }}
            >
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
                <Button
                    type="submit"
                    variant="contained"
                    disabled={bookingSlotId === null || bookingLoading}
                    fullWidth
                >
                    {bookingLoading ? 'Enviando…' : 'Solicitar turno'}
                </Button>
                {bookingError && (
                    <Typography
                        color="error"
                        variant="body2"
                        align="center"
                        sx={{ mt: 1 }}
                    >
                        {bookingError}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};
