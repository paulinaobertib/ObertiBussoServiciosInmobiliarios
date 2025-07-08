import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useAppointments } from '../../../hooks/useAppoitments';

export const AppointmentForm = () => {
    /* --- booking state del hook --- */
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
            <Box sx={{ textAlign: 'center', p: 3 }}>
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
                gap: 3,
                p: 2,
                gridTemplateAreas: {
                    xs: `"cal" "slots" "notes"`,
                    md: `"cal cal" "slots notes"`,
                },
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
        >
            {/* CALENDARIO */}
            <Box gridArea="cal">
                <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
                    Seleccioná un día
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                        value={bookingDate}
                        onChange={(d) => d && setBookingDate(d)}
                        disablePast
                    />
                </LocalizationProvider>
            </Box>

            {/* SLOTS */}
            <Box gridArea="slots">
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
                            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
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
                                    sx={{ py: 1.5 }}
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
            <Box gridArea="notes" sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
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
                    <Typography color="error" variant="body2" align="center" sx={{ mt: 1 }}>
                        {bookingError}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};
