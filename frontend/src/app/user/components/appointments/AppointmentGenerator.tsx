import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
    Box,
    Stack,
    Typography,
    TextField,
    Divider,
    useTheme,
} from '@mui/material';
import {
    createAvailability,
    getAllAvailabilities,
} from '../../services/appointment.service';
import {
    AvailableAppointment,
    AvailableAppointmentDTO,
} from '../../types/appointment';
import { Calendar } from '../Calendar';
import { LoadingButton } from '@mui/lab';

interface Props {
    onCreated: () => void;
}

export const AppointmentGenerator = ({ onCreated }: Props) => {
    const theme = useTheme();

    /* ─────────────────────────────────────── state */
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('13:00');
    const [slots, setSlots] = useState<AvailableAppointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ─────────────────────────────────────── helpers */
    const loadSlots = async () => {
        setLoading(true);
        try {
            const all = (await getAllAvailabilities()).data;
            const dateStr = selectedDate.format('YYYY-MM-DD');
            setSlots(all.filter((s: AvailableAppointment) =>
                s.date.startsWith(dateStr)
            ));
            setError(null);
        } catch (e: any) {
            setError(e.response?.data || e.message);
        } finally {
            setLoading(false);
        }
    };

    /* ─────────────────────────────────────── efectos */
    useEffect(() => { loadSlots(); }, [selectedDate]);

    /* ─────────────────────────────────────── acciones */
    const handleGenerate = async () => {
        try {
            const dto: AvailableAppointmentDTO = {
                date: selectedDate.format('YYYY-MM-DD'),
                startTime: `${startTime}:00`,
                endTime: `${endTime}:00`,
            };
            await createAvailability(dto);
            await loadSlots();
            onCreated();
        } catch (e: any) {
            setError(e.response?.data || e.message);
        }
    };

    /* ─────────────────────────────────────── UI */
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
            }}
        >
            {/* ─── BLOQUE SUPERIOR ─── */}
            <Box sx={{ flex: 1, display: 'flex', gap: 3, overflow: 'hidden' }}>
                {/* Calendario */}
                <Box sx={{ flex: 1, minWidth: 250 }}>
                    <Calendar onSelectDate={setSelectedDate} initialDate={selectedDate} />
                </Box>

                {/* Lista de turnos */}
                <Box sx={{ flex: 1, minWidth: 250, overflowY: 'auto' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Turnos&nbsp;<strong>{selectedDate.format('DD/MM/YYYY')}</strong>
                    </Typography>

                    {loading ? (
                        <Typography variant="body2" color="text.secondary">
                            Cargando…
                        </Typography>
                    ) : slots.length === 0 ? (
                        <Typography color="text.secondary">Sin turnos.</Typography>
                    ) : (
                        <Stack spacing={1}>
                            {slots.map(s => (
                                <Box
                                    key={s.id}
                                    sx={{
                                        p: 1,
                                        border: '1px solid',
                                        borderColor: s.availability
                                            ? theme.palette.success.main
                                            : theme.palette.error.main,
                                        borderRadius: 1,
                                        fontSize: 14,
                                        bgcolor: s.availability
                                            ? theme.palette.success.light
                                            : theme.palette.error.light,
                                        color: s.availability
                                            ? theme.palette.success.contrastText
                                            : theme.palette.error.contrastText,
                                    }}
                                >
                                    {s.date.slice(11, 16)} — {s.availability ? 'Libre' : 'Ocupado'}
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Box>

            {/* ─── BLOQUE INFERIOR ─── */}
            <Box
                sx={{
                    mt: 3,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    flexShrink: 0,
                }}
            >
                <Divider sx={{ width: '100%' }} />
                <Typography variant="subtitle1">
                    Crear turnos del&nbsp;
                    <strong>{selectedDate.format('DD/MM/YYYY')}</strong>
                </Typography>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    <TextField
                        label="Desde"
                        type="time"
                        size="small"
                        fullWidth
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                    />
                    <TextField
                        label="Hasta"
                        type="time"
                        size="small"
                        fullWidth
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                    />
                </Stack>

                <LoadingButton
                    variant="contained"
                    onClick={handleGenerate}
                    disabled={loading}
                    sx={{ px: 4 }}
                >
                    Generar turnos
                </LoadingButton>
            </Box>

            {error && (
                <Typography
                    color="error"
                    variant="body2"
                    sx={{ mt: 1, textAlign: 'center', width: '100%' }}
                >
                    {error}
                </Typography>
            )}
        </Box>
    );
};