import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import type { Appointment, AvailableAppointment } from '../../../types/appointment';
import { AppointmentUserItem } from './AppointmentUserItem';

interface ListProps {
    appointments: Appointment[];
    slotMap: Record<number, AvailableAppointment>;
    onCancel: (id: number) => Promise<void>;
    reload: () => void;
}

export const AppointmentUserList = ({
    appointments,
    slotMap,
    onCancel,
    reload,
}: ListProps) => {
    // Filtra solo citas con slot válido
    const vetted = appointments.filter((a) => {
        const id = a.availableAppointment?.id;
        return id != null && Boolean(slotMap[id]);
    });

    if (vetted.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">Aún no tienes turnos.</Typography>
            </Box>
        );
    }

    // Ordena de más reciente a más antiguo
    const sorted = [...vetted].sort((a, b) =>
        dayjs(slotMap[b.availableAppointment!.id].date).diff(
            dayjs(slotMap[a.availableAppointment!.id].date)
        )
    );

    return (
        <Box>
            {sorted.map((a) => (
                <AppointmentUserItem
                    key={a.id}
                    appointment={a}
                    slot={slotMap[a.availableAppointment!.id]}
                    onCancel={onCancel}
                    afterCancel={reload}
                />
            ))}
        </Box>
    );
};
