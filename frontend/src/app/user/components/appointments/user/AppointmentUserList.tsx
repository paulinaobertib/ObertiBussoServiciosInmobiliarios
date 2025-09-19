import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import type { Appointment, AvailableAppointment } from '../../../types/appointment';
import { AppointmentUserItem } from './AppointmentUserItem';
import { EmptyState } from '../../../../shared/components/EmptyState';

interface Props {
    appointments: Appointment[];
    slotMap: Record<number, AvailableAppointment>;
    onCancel: (id: number) => Promise<void>;
    reload: () => void;
}

export const AppointmentUserList = ({ appointments, slotMap, onCancel, reload }: Props) => {
    const availables = appointments.filter((a) => {
        const id = a.availableAppointment?.id;
        return id != null && Boolean(slotMap[id]);
    });

    // 2) De esas, deja solo las de hoy en adelante
    const todayStart = dayjs().startOf('day');
    const upcoming = availables.filter((a) => {
        const slot = slotMap[a.availableAppointment!.id];
        // si la fecha del slot NO es anterior al inicio de hoy, lo incluimos
        return !dayjs(slot.date).isBefore(todayStart);
    });

    if (upcoming.length === 0) {
        return (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <EmptyState title="No hay turnos disponibles." />
            </Box>
        );
    }

    // Ordena de más reciente a más antiguo
    const sorted = [...upcoming].sort((a, b) =>
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
