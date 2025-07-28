import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Box, Typography, Chip, Divider, Stack } from '@mui/material';
import { AccessTime, Person, EmailOutlined, PhoneOutlined, ChatBubbleOutline } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Modal } from '../../../../shared/components/Modal';
import { useAppointments } from '../../../hooks/useAppointments';
import { getUserById } from '../../../services/user.service';
import type { User } from '../../../types/user';

interface Props {
    open: boolean;
    slotId: number | null;
    onClose: () => void;
    onAccept: (a: any) => Promise<void>;
    onReject: (a: any) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

export const AppointmentDetailsDialog = ({ open, slotId, onClose, onAccept, onReject, onDelete }: Props) => {
    const { slotMap, apptsBySlot, reloadAdmin, } = useAppointments();
    const slot = slotId != null ? slotMap[slotId] : undefined;
    const appt = slotId != null ? apptsBySlot[slotId] : undefined;

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);

    // Refresh data when dialog opens to ensure latest status
    useEffect(() => {
        if (open) reloadAdmin();
    }, [open, reloadAdmin]);

    // Reset user info when slot changes
    useEffect(() => {
        setUser(null);
        setLoadingUser(false);
    }, [slotId]);

    // Fetch user details if appointment exists
    useEffect(() => {
        if (appt?.userId) {
            setLoadingUser(true);
            getUserById(appt.userId)
                .then(res => setUser(res.data))
                .catch(() => { })
                .finally(() => setLoadingUser(false));
        }
    }, [appt]);

    if (!slot) return null;

    const statusLabel = slot.availability
        ? 'Disponible'
        : appt?.status === 'ESPERA'
            ? 'Pendiente'
            : appt?.status === 'ACEPTADO'
                ? 'Confirmado'
                : 'Rechazado';

    const handleAction = async (fn: () => Promise<void>) => {
        setLoading(true);
        try {
            await fn();
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <Modal open={open} title="Detalle del turno" onClose={onClose}>
            <Box sx={{ p: 2, minWidth: 280 }}>
                {/* Header: hora - fecha and chip right */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime color="action" />
                        <Typography variant="h6">
                            {dayjs(slot.date).format('HH:mm')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            - {dayjs(slot.date).locale('es').format('dddd D [de] MMMM YYYY')}
                        </Typography>
                    </Box>
                    <Chip
                        label={statusLabel}
                        variant="outlined"
                        color={slot.availability ? 'default' : statusLabel === 'Pendiente' ? 'warning' : statusLabel === 'Confirmado' ? 'info' : 'error'}
                        size="small"
                    />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Detalles: usuario y comentario */}
                {appt && (
                    <Stack spacing={1} mb={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person color="action" />
                            <Typography variant="body2">
                                {loadingUser
                                    ? 'Cargando...'
                                    : user
                                        ? `${user.firstName} ${user.lastName}`
                                        : 'Cliente'}
                            </Typography>
                        </Box>
                        {user?.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailOutlined color="action" />
                                <Typography variant="body2">{user.email}</Typography>
                            </Box>
                        )}
                        {user?.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneOutlined color="action" />
                                <Typography variant="body2">{user.phone}</Typography>
                            </Box>
                        )}
                        {appt.comment && (
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <ChatBubbleOutline color="action" sx={{ mt: 0.3 }} />
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    {appt.comment}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Botones de acción */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {slot.availability && (
                        <LoadingButton
                            loading={loading}
                            variant="outlined"
                            color="error"
                            onClick={() => handleAction(() => onDelete(slot.id))}
                        >
                            Eliminar
                        </LoadingButton>
                    )}
                    {appt?.status === 'ESPERA' && (
                        <>
                            <LoadingButton
                                loading={loading}
                                variant="outlined"
                                color="error"
                                onClick={() => handleAction(() => onReject(appt))}
                            >
                                Rechazar
                            </LoadingButton>
                            <LoadingButton
                                loading={loading}
                                variant="contained"
                                color="success"
                                onClick={() => handleAction(() => onAccept(appt))}
                            >
                                Confirmar
                            </LoadingButton>
                        </>
                    )}
                    {appt?.status === 'ACEPTADO' && (
                        <LoadingButton
                            loading={loading}
                            variant="outlined"
                            color="warning"
                            onClick={() => handleAction(() => onReject(appt))}
                        >
                            Cancelar
                        </LoadingButton>
                    )}
                </Box>
            </Box>
        </Modal>
    );
}
