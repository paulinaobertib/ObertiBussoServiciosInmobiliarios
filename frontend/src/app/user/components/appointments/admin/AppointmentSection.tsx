import { useMemo } from 'react';
import { Dayjs } from 'dayjs';
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { AppointmentsList } from './AppointmentsList';
import type { Appointment, AvailableAppointment } from '../../../types/appointment';

type Status = 'DISPONIBLE' | 'ESPERA' | 'ACEPTADO' | 'RECHAZADO';

interface Props {
    loading: boolean;
    selectedDate: Dayjs;
    filter: Status | 'TODOS';
    setFilter: (f: Status | 'TODOS') => void;
    slotsByDate: Record<string, AvailableAppointment[]>;
    apptsBySlot: Record<number, Appointment>;
    onSelectSlot: (slotId: number) => void;
}

export const AppointmentSection = ({ loading, selectedDate, filter, setFilter, slotsByDate, apptsBySlot, onSelectSlot }: Props) => {
    const dateKey = selectedDate.format('YYYY-MM-DD');
    const daySlots = slotsByDate[dateKey] ?? [];

    const filtered = useMemo(
        () =>
            daySlots.filter((s) => {
                if (filter === 'TODOS') return true;
                if (filter === 'DISPONIBLE') return s.availability;
                const appt = apptsBySlot[s.id];
                return appt ? appt.status === filter : false;
            }),
        [daySlots, filter, apptsBySlot],
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress size={36} />
            </Box>
        );
    }

    return (
        <>
            {/* Encabezado con filtro */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {selectedDate.locale('es').format('dddd DD MMMM YYYY')}
                </Typography>

                <FormControl size="small">
                    <InputLabel id="filter-label">Estado</InputLabel>
                    <Select
                        labelId="filter-label"
                        value={filter}
                        label="Estado"
                        onChange={(e) => setFilter(e.target.value as Status | 'TODOS')}
                        sx={{ width: 180 }}
                    >
                        {['TODOS', 'DISPONIBLE', 'ESPERA', 'ACEPTADO', 'RECHAZADO'].map((v) => (
                            <MenuItem key={v} value={v}>
                                {v === 'TODOS' ? 'Todos' : v.charAt(0) + v.slice(1).toLowerCase()}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Lista */}
            <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1, maxHeight: 600 }}>
                <AppointmentsList
                    slots={filtered}
                    apptsBySlot={apptsBySlot}
                    onSelect={onSelectSlot}
                />
            </Box>
        </>
    );
};
