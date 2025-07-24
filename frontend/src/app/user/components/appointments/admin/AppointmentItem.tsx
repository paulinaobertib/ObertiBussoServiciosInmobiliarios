// src/app/user/components/appointments/SlotItem.tsx
import React, { useEffect, useState } from 'react';
import { Paper, Stack, Typography, Chip, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { getUserById } from '../../../services/user.service';
import type { Appointment, AvailableAppointment } from '../../../types/appointment';
import type { User } from '../../../types/user';

type Status = 'DISPONIBLE' | 'ESPERA' | 'ACEPTADO' | 'RECHAZADO';

interface Props {
    slot: AvailableAppointment;
    appt?: Appointment;
    onClick: (slotId: number) => void;
}

const statusChip = (s: Status) => {
    switch (s) {
        case 'DISPONIBLE':
            return { label: 'Disponible', color: 'primary.main' as const };
        case 'ESPERA':
            return { label: 'Pendiente', color: 'primary.main' as const };
        case 'ACEPTADO':
            return { label: 'Confirmado', color: 'primary.main' as const };
        case 'RECHAZADO':
            return { label: 'Rechazado', color: 'primary.main' as const };
    }
};

export const AppointmentItem: React.FC<Props> = ({ slot, appt, onClick }) => {
    const theme = useTheme();
    const status: Status = slot.availability ? 'DISPONIBLE' : (appt?.status as Status);
    const chip = statusChip(status);

    // State to hold fetched user info
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);

    useEffect(() => {
        if (appt?.userId) {
            setLoadingUser(true);
            getUserById(appt.userId)
                .then((res) => setUser(res.data))
                .catch(() => { })
                .finally(() => setLoadingUser(false));
        }
    }, [appt]);

    return (
        <Paper
            variant="outlined"
            sx={{
                mb: 1.5,
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: theme.palette.action.hover },
            }}
            onClick={() => onClick(slot.id)}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="h6">{dayjs(slot.date).format('HH:mm')}</Typography>
                    <Chip label={chip.label} variant="outlined" color="primary" size="small" />
                </Stack>

                {appt ? (
                    <Typography>
                        {loadingUser
                            ? 'Cargando...'
                            : user
                                ? `${user.firstName} ${user.lastName}`
                                : 'Cliente'
                        }
                    </Typography>
                ) : (
                    <Typography color="text.disabled">Libre</Typography>
                )}
            </Stack>
        </Paper>
    );
};
