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
    deleteAppointment,
    getAllAvailabilities,      // <—+++++++++
} from '../../services/appointment.service';
import { useAuthContext } from '../../../user/context/AuthContext';
import { AppointmentCard } from './AppointmentCard';

export const AppointmentUser = () => {
    const { info } = useAuthContext();

    const [appts, setAppts] = useState<Appointment[]>([]);
    const [slotMap, setSlotMap] = useState<Record<number, AvailableAppointment>>({});
    const [loading, setLoading] = useState(false);

    /* ─── Carga de citas y slots ─── */
    const load = async () => {
        if (!info) return;
        setLoading(true);
        try {
            // 1) traigo las citas del usuario
            const aRes = await getAppointmentsByUser(info.id);
            const apptsData = aRes.data as Appointment[];
            setAppts(apptsData);

            // 2) traigo *todos* los slots completos
            const slotsRes = await getAllAvailabilities();
            const allSlots = slotsRes.data as AvailableAppointment[];

            // 3) construyo el map id → AvailableAppointment completo
            const map: Record<number, AvailableAppointment> = {};
            allSlots.forEach(slot => {
                map[slot.id] = slot;
            });
            setSlotMap(map);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [info]);

    /* ─── Cancelar turno ─── */
    const cancel = async (id: number) => {
        await deleteAppointment(id);
        await load();
    };

    if (!info) return null;

    return (
        <Box sx={{ p: 3 }}>

            {loading ? (
                <Typography>Cargando…</Typography>
            ) : appts.length === 0 ? (
                <Typography color="text.secondary">Aún no tienes turnos.</Typography>
            ) : (
                <Stack spacing={2}>
                    {appts
                        // eliminamos citas sin slot en el map
                        .filter(a => a.availableAppointment?.id != null && slotMap[a.availableAppointment.id])
                        // ordenamos según la fecha real del slot
                        .sort((a, b) => {
                            const dateA = dayjs(slotMap[a.availableAppointment.id].date).valueOf();
                            const dateB = dayjs(slotMap[b.availableAppointment.id].date).valueOf();
                            return dateA - dateB;
                        })
                        // renderizamos usando ya el slot completo
                        .map(a => (
                            <AppointmentCard
                                key={a.id}
                                appointment={a}
                                slot={slotMap[a.availableAppointment.id]}
                                onCancel={cancel}
                            />
                        ))}
                </Stack>
            )}
        </Box>
    );
};
