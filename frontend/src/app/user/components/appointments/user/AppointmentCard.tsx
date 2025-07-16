import { useState } from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import dayjs from 'dayjs';
import type {
    Appointment,
    AvailableAppointment,
} from '../../../types/appointment';

interface Props {
    appointment: Appointment;
    slot: AvailableAppointment;
    isAdmin?: boolean;
    onCancel?: (id: number) => Promise<void>;
    onSelect?: (a: Appointment) => void;
}

export const AppointmentCard = ({
    appointment,
    slot,
    isAdmin = false,
    onCancel,
    onSelect,
}: Props) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const handleCancel = async () => {
        if (!onCancel) return;
        setLoading(true);
        await onCancel(appointment.id);
        setLoading(false);
    };

    return (
        <Box
            onClick={() => onSelect?.(appointment)}
            sx={{
                position: 'relative',
                cursor: onSelect ? 'pointer' : 'default',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.paper,
            }}
        >
            <Chip
                label={appointment.status}
                size="small"
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: theme.palette.primary.main,
                    color: 'black',
                }}
            />

            <Typography variant="subtitle2" color="text.secondary">
                Turno #{appointment.id}
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                Día: {dayjs(slot.date).format('DD/MM/YYYY')} <br />
                Hora: {dayjs(slot.date).format('HH:mm')}
            </Typography>

            {appointment.comment && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                    {appointment.comment}
                </Typography>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* ─── Footer con acción ─── */}
            <Box sx={{ display: 'flex', justifyContent: 'right', }} >
                {appointment.status === 'ESPERA' || appointment.status === 'ACEPTADO' && !isAdmin ? (
                    /* usuario puede cancelar mientras está pendiente */
                    <LoadingButton
                        size="small"
                        variant="outlined"
                        color="error"
                        loading={loading}
                        onClick={e => {
                            e.stopPropagation();
                            handleCancel();
                        }}
                    >
                        Cancelar turno
                    </LoadingButton>
                ) : null}
            </Box>
        </Box>
    );
};
