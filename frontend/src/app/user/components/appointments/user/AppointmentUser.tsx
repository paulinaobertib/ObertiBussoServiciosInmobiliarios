import dayjs from 'dayjs';
import { Box, Stack, Typography } from '@mui/material';
import { useAppointments } from '../../../hooks/useAppointments';
import { AppointmentCard } from './AppointmentCard';

export const AppointmentUser = () => {
    const { userLoading, userAppointments, slotMap, cancelAppointment, } = useAppointments();

    if (userLoading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Cargando…</Typography>
            </Box>
        );
    }

    if (userAppointments.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">Aún no tienes turnos.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
                {userAppointments
                    .filter(
                        (a) =>
                            a.availableAppointment?.id != null &&
                            slotMap[a.availableAppointment.id]
                    )
                    .sort((a, b) =>
                        dayjs(slotMap[a.availableAppointment.id].date).diff(
                            slotMap[b.availableAppointment.id].date
                        )
                    )
                    .map((a) => (
                        <AppointmentCard
                            key={a.id}
                            appointment={a}
                            slot={slotMap[a.availableAppointment.id]}
                            onCancel={cancelAppointment}
                        />
                    ))}
            </Stack>
        </Box>
    );
};
