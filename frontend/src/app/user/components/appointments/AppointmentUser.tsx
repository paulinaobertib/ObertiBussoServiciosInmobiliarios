
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
    Box,
    Stack,
    Typography,
} from '@mui/material';

import {
    Appointment,
    AvailableAppointment,
} from '../../types/appointment';
import {
    getAppointmentsByUser,
    getAllAvailabilities,
    deleteAppointment,
} from '../../services/appointment.service';
import { useAuthContext } from '../../../user/context/AuthContext';
import { AppointmentCard } from './AppointmentCard';

export const AppointmentUser = () => {
    const { info } = useAuthContext();

    const [appts, setAppts] = useState<Appointment[]>([]);
    const [slotMap, setSlotMap] = useState<Record<number, AvailableAppointment>>({});
    const [loading, setLoading] = useState(false);
    const [_, setActionId] = useState<number | null>(null);

    /* 2 ─ Cargar citas + slots */
    const load = async () => {
        if (!info) return;
        setLoading(true);
        const [aRes, sRes] = await Promise.all([
            getAppointmentsByUser(info.id),
            getAllAvailabilities(),
        ]);
        setAppts(aRes.data as Appointment[]);

        const map: Record<number, AvailableAppointment> = {};
        (sRes.data as AvailableAppointment[]).forEach(s => (map[s.id] = s));
        setSlotMap(map);
        setLoading(false);
    };
    useEffect(() => { load(); }, [info]);

    /* 3 ─ Cancelar pendiente */
    const cancel = async (id: number) => {
        setActionId(id);
        await deleteAppointment(id);
        await load();
        setActionId(null);
    };

    /* 4 ─ UI */
    if (!info) return null;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700} mb={3}>
                Mis turnos
            </Typography>

            {loading ? (
                <Typography>Cargando…</Typography>
            ) : appts.length === 0 ? (
                <Typography color="text.secondary">Aún no tienes turnos.</Typography>
            ) : (
                <Stack spacing={2}>
                    {appts
                        .sort(
                            (a, b) =>
                                dayjs(slotMap[a.availableAppointment.id]?.date).valueOf() -
                                dayjs(slotMap[b.availableAppointment.id]?.date).valueOf()
                        )
                        .map(a => (
                            <AppointmentCard
                                key={a.id}
                                appointment={a}
                                slot={slotMap[a.availableAppointment.id]}
                                onCancel={id => cancel(id)}          // ⬅️ sólo si quieres permitir cancelar
                            />
                        ))}
                </Stack>
            )}
        </Box>
    );
};
