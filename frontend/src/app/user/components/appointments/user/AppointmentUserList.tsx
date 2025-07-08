import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import type { Appointment, AvailableAppointment } from '../../../types/appointment';
import { AppointmentUserItem } from './AppointmentUserItem';

interface ListProps {
    appointments: Appointment[];
    slotMap: Record<number, AvailableAppointment>;
    onCancel: (id: number) => Promise<void>;
    reload: () => void;                     // 👉 trae reloadUser
}

export const AppointmentUserList = ({ appointments, slotMap, onCancel, reload }: ListProps) => {
    // Filtra sólo citas con slot válido
    const vetted = appointments.filter((a) => {
        const id = a.availableAppointment?.id;
        return id != null && slotMap[id];
    });

    if (vetted.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">Aún no tienes turnos.</Typography>
            </Box>
        );
    }

    const sorted = vetted.sort((a, b) =>
        dayjs(slotMap[a.availableAppointment!.id].date).diff(
            dayjs(slotMap[b.availableAppointment!.id].date)
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