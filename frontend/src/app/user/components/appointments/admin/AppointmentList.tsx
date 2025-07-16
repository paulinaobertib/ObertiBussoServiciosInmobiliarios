import dayjs from 'dayjs';
import { Box, Typography, useTheme } from '@mui/material';
import { AppointmentItem } from './AppointmentItem';
import type { AvailableAppointment } from '../../../types/appointment';

interface Props {
    slotsByDate: Record<string, AvailableAppointment[]>;
    statusColor: (
        s: AvailableAppointment
    ) => 'success' | 'warning' | 'info' | 'error' | undefined;
    onSelect: (s: AvailableAppointment) => void;
}

export const AppointmentList = ({
    slotsByDate,
    statusColor,
    onSelect,
}: Props) => {
    const theme = useTheme();
    const dates = Object.keys(slotsByDate).sort((a, b) =>
        dayjs(a).diff(dayjs(b))
    );

    if (dates.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ px: 3 }}>
                Sin turnos.
            </Typography>
        );
    }

    return (
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {dates.map((date) => {
                const day = dayjs(date);
                const slots = slotsByDate[date].slice().sort((a, b) =>
                    dayjs(a.date).diff(dayjs(b.date))
                );

                return (
                    <Box
                        key={date}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {/* Columna izquierda: DÍA / MES con divisor */}
                        <Box
                            sx={{
                                width: 80,
                                textAlign: 'center',
                                mr: 2,
                                borderRight: `4px solid ${theme.palette.divider}`,
                                bgcolor: theme.palette.action.hover,
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant="h4" lineHeight={1}>
                                {day.format('DD')}
                            </Typography>
                            <Typography variant="caption" textTransform="uppercase">
                                {day.format('MMMM')}
                            </Typography>
                        </Box>

                        {/* Columna derecha: grid de horas */}
                        <Box
                            sx={{
                                flex: 1,
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
                                gap: 1,
                            }}
                        >
                            {slots.map((slot) => (
                                <AppointmentItem
                                    key={slot.id}
                                    slot={slot}
                                    color={statusColor(slot)}
                                    onClick={onSelect}
                                />
                            ))}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};
