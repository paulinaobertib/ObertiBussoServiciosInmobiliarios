import { useEffect, useState } from 'react';
import { Paper, Stack, Typography, Chip, useTheme, Box } from '@mui/material';
import dayjs from 'dayjs';
import { getUserById } from '../../../services/user.service';
import type { Appointment, AvailableAppointment } from '../../../types/appointment';
import type { User } from '../../../types/user';

type Status = 'DISPONIBLE' | 'ESPERA' | 'ACEPTADO' | 'RECHAZADO';

const statusChip = (s: Status) => {
    switch (s) {
        case 'DISPONIBLE': return { label: 'Disponible' };
        case 'ESPERA': return { label: 'Pendiente' };
        case 'ACEPTADO': return { label: 'Confirmado' };
        case 'RECHAZADO': return { label: 'Rechazado' };
    }
};

interface Props {
    slot: AvailableAppointment;
    appt?: Appointment;
    onClick: (slotId: number) => void;
}

export const AppointmentItem = ({ slot, appt, onClick }: Props) => {
    const theme = useTheme();
    const status: Status = slot.availability ? 'DISPONIBLE' : (appt?.status as Status);
    const chip = statusChip(status);

    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);

    useEffect(() => {
        if (appt?.userId) {
            setLoadingUser(true);
            getUserById(appt.userId)
                .then(res => setUser(res.data))
                .catch(() => { })
                .finally(() => setLoadingUser(false));
        }
    }, [appt]);

    return (
        <Paper
            variant="outlined"
            sx={{
                mb: 1.25,
                p: { xs: 1.25, sm: 1.5 },
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: theme.palette.action.hover },
            }}
            onClick={() => onClick(slot.id)}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 1, sm: 2 }}
                useFlexGap
                flexWrap="wrap"
            >
                {/* Hora/fecha — ancho estable */}
                <Stack
                    spacing={0.5}
                    alignItems="center"
                    sx={{ width: 64, flexShrink: 0 }}
                >
                    <Typography variant="h6" lineHeight={1.1}>
                        {dayjs(slot.date).format('HH:mm')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {dayjs(slot.date).format('DD/MM')}
                    </Typography>
                </Stack>

                {/* Estado */}
                <Chip
                    label={chip.label}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ flexShrink: 0 }}
                />

                {/* Nombre / Libre — ocupa el resto, con elipsis */}
                <Box sx={{ ml: 'auto', minWidth: 120, flex: 1, overflow: 'hidden' }}>
                    {appt ? (
                        <Typography noWrap>
                            {loadingUser ? 'Cargando…' : user ? `${user.firstName} ${user.lastName}` : 'Cliente'}
                        </Typography>
                    ) : (
                        <Typography color="text.disabled" noWrap>Libre</Typography>
                    )}
                </Box>
            </Stack>
        </Paper>
    );
};
