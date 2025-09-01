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

    const fechaEs = selectedDate.locale('es').format('dddd D [de] MMMM [de] YYYY');
    const fechaCap = fechaEs.charAt(0).toUpperCase() + fechaEs.slice(1);


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
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr auto' }, // en xs apila, en sm+ quedan lado a lado
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{ textTransform: 'none', wordBreak: 'break-word' }}
                >
                    {fechaCap}
                </Typography>

                <FormControl size="small" sx={{ minWidth: 160, width: { xs: '100%', sm: 'auto' } }}>
                    <InputLabel id="estado-label">Estado</InputLabel>
                    <Select
                        labelId="estado-label"
                        label="Estado"
                        value={filter}                 // o el state que uses
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <MenuItem value="TODOS">Todos</MenuItem>
                        <MenuItem value="DISPONIBLE">Disponibles</MenuItem>
                        <MenuItem value="ESPERA">Pendientes</MenuItem>
                        <MenuItem value="ACEPTADO">Confirmados</MenuItem>
                        <MenuItem value="RECHAZADO">Rechazados</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Lista */}
            <Box sx={{ overflowY: 'auto', flexGrow: 1, maxHeight: 600 }}>
                <AppointmentsList
                    slots={filtered}
                    apptsBySlot={apptsBySlot}
                    onSelect={onSelectSlot}
                />
            </Box>

        </>
    );
};