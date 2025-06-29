import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { getAllAvailabilities, createAppointment, } from '../../services/appointment.service';
import { AppointmentCreate, AvailableAppointment } from '../../types/appointment';
import { useAuthContext } from '../../../user/context/AuthContext';

export const AppointmentForm = () => {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [slots, setSlots] = useState<AvailableAppointment[]>([]);
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { info } = useAuthContext();

    // Carga los slots (solo por fecha, no por disponibilidad)
    const loadSlotsFor = async (date: Dayjs) => {
        setLoading(true);
        setError(null);
        setSelectedSlotId(null);
        try {
            const res = await getAllAvailabilities();
            const all = res.data as AvailableAppointment[];
            const dateStr = date.format('YYYY-MM-DD');
            setSlots(all.filter(s => s.date.startsWith(dateStr))); // :contentReference[oaicite:1]{index=1}
        } catch (err: any) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Al cambiar la fecha…
    const handleDateChange = (d: Dayjs | null) => {
        setSelectedDate(d);
        setSuccess(null);
        if (d) loadSlotsFor(d);
    };

    // Crear la cita en ESPERA
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSlotId === null) return;

        const userId = info?.id;
        if (!userId) {
            setError('Usuario no autenticado');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const body: AppointmentCreate = {
                userId,
                comment: notes || 'Quisiera confirmar horario',
                status: 'ESPERA',
                availableAppointment: { id: selectedSlotId },
            };

            console.log('Enviando JSON:', body);
            await createAppointment(body);

            setSuccess('Solicitud enviada. Queda en espera de aprobación.');
            setNotes('');
            await loadSlotsFor(selectedDate!);
        } catch (err: any) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                width: '100%',
                p: 2,
            }}
        >
            {/* Calendario */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
                        Seleccioná un día
                    </Typography>
                    <DateCalendar
                        value={selectedDate}
                        onChange={handleDateChange}
                        disablePast
                        sx={{
                            width: '100%',
                            '& .MuiPickersDay-root': {
                                width: { xs: 38, sm: 42, md: 46 },
                                height: { xs: 38, sm: 42, md: 46 },
                                m: 0.5,
                            },
                        }}
                    />
                </Box>
            </LocalizationProvider>

            {/* Slots + notas */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {error && <Typography color="error">{error}</Typography>}
                {success && <Typography color="success.main">{success}</Typography>}

                <Box>
                    <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
                        Horarios disponibles
                    </Typography>
                    {loading ? (
                        <Box sx={{ textAlign: 'center' }}><CircularProgress /></Box>
                    ) : slots.length === 0 ? (
                        <Typography color="text.secondary" align="center">
                            No hay turnos para este día.
                        </Typography>
                    ) : (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',  // <- aquí: dos columnas fijas
                                gap: 1,
                            }}
                        >
                            {slots.map(slot => {
                                const timeLabel = slot.date.slice(11, 16);
                                return (
                                    <Button
                                        key={slot.id}
                                        variant={selectedSlotId === slot.id ? 'contained' : 'outlined'}
                                        size="small"
                                        fullWidth
                                        sx={{ py: 1.5 }}
                                        onClick={() => slot.availability && setSelectedSlotId(slot.id)}
                                        disabled={!slot.availability}
                                    >
                                        {timeLabel}
                                    </Button>
                                );
                            })}
                        </Box>
                    )}
                </Box>

                <TextField
                    label="Comentarios Adicionales"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                />

                <Button
                    type="submit"
                    variant="contained"
                    disabled={selectedSlotId === null || loading}
                    fullWidth
                    sx={{ py: 1.3 }}
                >
                    {loading ? 'Enviando…' : 'Solicitar Turno'}
                </Button>
            </Box>
        </Box>
    );
}
