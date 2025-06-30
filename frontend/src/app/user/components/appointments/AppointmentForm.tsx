import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Box, Button, CircularProgress, TextField, Typography, } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { getAllAvailabilities, createAppointment, } from '../../services/appointment.service';
import { AppointmentCreate, AvailableAppointment, } from '../../types/appointment';
import { useAuthContext } from '../../../user/context/AuthContext';

export const AppointmentForm = () => {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [slots, setSlots] = useState<AvailableAppointment[]>([]);
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const { info } = useAuthContext();

    const loadSlotsFor = async (date: Dayjs) => {
        setLoading(true); setError(null); setSelectedSlotId(null);
        try {
            const res = await getAllAvailabilities();
            const all = res.data as AvailableAppointment[];
            const dateStr = date.format('YYYY-MM-DD');
            setSlots(all.filter(s => s.date.startsWith(dateStr)));
        } catch (err: any) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (d: Dayjs | null) => {
        setSelectedDate(d);
        if (d) loadSlotsFor(d);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSlotId === null) return;
        const userId = info?.id;
        if (!userId) {
            setError('Usuario no autenticado');
            return;
        }

        setLoading(true); setError(null);
        try {
            const body: AppointmentCreate = {
                userId,
                comment: notes || 'Quisiera confirmar horario',
                status: 'ESPERA',
                availableAppointment: { id: selectedSlotId },
            };
            await createAppointment(body);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // p: 3,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h6" gutterBottom>
                    ¡Turno solicitado con éxito!
                </Typography>
                <Typography>
                    Gracias. Te avisaremos cuando tu turno sea aceptado.
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'grid',
                gap: 3,
                p: 2,
                overflowX: 'hidden',
                gridTemplateAreas: {
                    xs: `"cal" "slots" "notes"`,
                    md: `"cal cal" "slots notes"`,
                },
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gridAutoRows: 'min-content',
            }}
        >
            {/* ─── calendario ─── */}
            <Box gridArea="cal">
                <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
                    Seleccioná un día
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                        value={selectedDate}
                        onChange={handleDateChange}
                        disablePast
                        sx={{
                            width: '100%',
                            '& .MuiPickersDay-root': {
                                width: { xs: 38, sm: 42, md: 46 },
                                m: 0.5,
                                borderRadius: 1,
                            },
                        }}
                    />
                </LocalizationProvider>
            </Box>

            {/* ─── horarios ─── */}
            <Box gridArea="slots">
                <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
                    Horarios disponibles
                </Typography>
                {loading ? (
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : slots.length === 0 ? (
                    <Typography color="text.secondary" align="center">
                        No hay turnos para este día.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 1,
                            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                        }}
                    >
                        {slots.map(slot => {
                            const time = slot.date.slice(11, 16);
                            const selected = selectedSlotId === slot.id;
                            return (
                                <Button
                                    key={slot.id}
                                    variant={selected ? 'contained' : 'outlined'}
                                    size="small"
                                    fullWidth
                                    sx={{ py: 1.5 }}
                                    onClick={() => slot.availability && setSelectedSlotId(slot.id)}
                                    disabled={!slot.availability}
                                >
                                    {time}
                                </Button>
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* ─── notas + botón ─── */}
            <Box
                gridArea="notes"
                sx={{ display: 'flex', flexDirection: 'column' }}
            >
                <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
                    Comentarios
                </Typography>

                <TextField
                    label="Comentarios Adicionales"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    sx={{ mb: 2 }}
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
};
