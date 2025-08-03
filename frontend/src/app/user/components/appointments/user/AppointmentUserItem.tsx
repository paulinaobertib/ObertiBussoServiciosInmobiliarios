import { useState } from 'react';
import { Box, Card, Typography, Chip, Divider, useTheme, useMediaQuery } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { LoadingButton } from '@mui/lab';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import type { Appointment, AvailableAppointment } from '../../../types/appointment';

interface Props {
    appointment: Appointment;
    slot: AvailableAppointment;
    onCancel: (id: number) => Promise<void>;
    afterCancel: () => void;
}

const statusMap = {
    ACEPTADO: { label: 'Confirmado', color: 'primary' },
    ESPERA: { label: 'Pendiente', color: 'primary' },
    RECHAZADO: { label: 'Rechazado', color: 'primary' },
};

export const AppointmentUserItem = ({ appointment, slot, onCancel, afterCancel }: Props) => {
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const date = dayjs(slot.date).locale('es');
    const { label } = statusMap[appointment.status] || {};

    const handleCancel = async () => {
        setLoading(true);
        await onCancel(appointment.id);
        setLoading(false);
        afterCancel();
    };

    // Fecha + icono
    const DateBox = (
        <Box display="flex" alignItems="center" gap={1}>
            <CalendarTodayIcon color="action" />
            <Typography variant="subtitle1" fontWeight={600}>
                {date.format('D [de] MMMM, [a las] HH:mm')}
            </Typography>
        </Box>
    );

    // Chip de estado
    const ChipBox = (
        <Chip variant="outlined" label={label} size="small" color='primary' />
    );

    // Notas
    const Notes = (
        <Box
            sx={{
                bgcolor: theme.palette.grey[100],
                borderRadius: 1,
                px: 2,
                py: 1,
                flex: 1,
            }}
        >
            <Typography variant="body2" fontWeight={500}>
                Notas:
            </Typography>
            <Typography variant="body2" color="text.primary" mt={0.5}>
                {appointment.comment || '—'}
            </Typography>
        </Box>
    );

    // Botón cancelar
    const CancelBtn = (
        <LoadingButton
            size='small'
            variant="outlined"
            color="error"
            loading={loading}
            onClick={handleCancel}
        >
            Cancelar
        </LoadingButton>
    );

    return (
        <Card
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                '& + &': { mt: 2 },
            }}
        >
            {isMobile ? (
                <>
                    {/* MÓVIL: fecha | chip */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        {DateBox}
                        {ChipBox}
                    </Box>

                    {/* Notas debajo */}
                    <Box mt={2}>{Notes}</Box>

                    {/* Cancelar abajo */}
                    <Box mt={2} display="flex" justifyContent="flex-end">
                        {CancelBtn}
                    </Box>
                </>
            ) : (
                // DESKTOP: agrupo date+chip en contenedor fijo, luego divider
                <Box display="flex" alignItems="center">
                    {/* Contenedor fijo para fecha + chip */}
                    <Box
                        sx={{
                            minWidth: 300,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                        }}
                    >
                        {DateBox}
                        {ChipBox}
                    </Box>

                    {/* Divider siempre al mismo lugar */}
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ mx: 3, bgcolor: theme.palette.grey[300] }}
                    />

                    {/* Notas y botón */}
                    {Notes}
                    <Box ml={3}>{CancelBtn}</Box>
                </Box>
            )}
        </Card>
    );
};
