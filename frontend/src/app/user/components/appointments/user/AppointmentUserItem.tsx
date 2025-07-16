import React, { useState } from 'react';
import { Box, Typography, useTheme, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import dayjs from 'dayjs';
import type { Appointment, AvailableAppointment } from '../../../types/appointment';

interface ItemProps {
    appointment: Appointment;
    slot: AvailableAppointment;
    onCancel: (id: number) => Promise<void>;
    afterCancel: () => void; // 👉 avisa al padre para recarga
}
export const AppointmentUserItem = ({ appointment, slot, onCancel, afterCancel }: ItemProps) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const date = dayjs(slot.date);

    const APPOINTMENT_GRID = '1fr 1fr 2fr 1fr 150px';

    // Colores por estado
    const statusBg =
        appointment.status === 'ACEPTADO'
            ? theme.palette.success.main
            : appointment.status === 'ESPERA'
                ? theme.palette.warning.main
                : theme.palette.error.main;
    const statusFg = theme.palette.getContrastText(statusBg);

    const handleCancel = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        await onCancel(appointment.id);
        setLoading(false);
        afterCancel();
    };

    return (
        <Box
            sx={{
                display: { xs: 'block', sm: 'grid' },
                gridTemplateColumns: APPOINTMENT_GRID,
                alignItems: 'center',
                px: 2,
                py: 1,
                gap: 1,
                '&:hover': { bgcolor: theme.palette.action.hover },
            }}
        >
            {/* ── Móvil (stack) ── */}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Typography fontWeight={600} gutterBottom>
                    {date.format('DD/MM/YYYY • HH:mm')}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                    {appointment.comment || '—'}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                    {appointment.status}
                </Typography>
                <LoadingButton
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="error"
                    loading={loading}
                    onClick={handleCancel}
                >
                    Cancelar turno
                </LoadingButton>
            </Box>

            {/* ── Desktop grid ── */}
            <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{date.format('DD/MM/YYYY')}</Typography>
            <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{date.format('HH:mm')}</Typography>
            <Typography
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {appointment.comment || '—'}
            </Typography>
            <Button
                variant="contained"
                size="small"
                disableElevation
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    bgcolor: statusBg,
                    color: statusFg,
                    minWidth: 96,
                    textTransform: 'none',
                    pointerEvents: 'none',
                    justifySelf: 'start',
                }}
            >
                {appointment.status}
            </Button>
            <LoadingButton
                size="small"
                variant="outlined"
                color="error"
                loading={loading}
                onClick={handleCancel}
                sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 120 }}
            >
                Cancelar turno
            </LoadingButton>
        </Box>
    );
};
