import { useEffect, useState } from 'react';
import { Box, Card, Typography, Chip, Divider, useTheme, useMediaQuery } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import type { ChatSession } from '../../../chat/types/chatSession';
import { useAuthContext } from '../../../user/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { buildRoute, ROUTES } from '../../../../lib';
import { getPropertyById } from '../../services/property.service';

interface Props {
    session: ChatSession;
    loading: boolean;
    onClose: (id: number) => void;
}

const statusMap: Record<'ABIERTA' | 'CERRADA', { label: string }> = {
    ABIERTA: { label: 'Abierta' },
    CERRADA: { label: 'Cerrada' },
};

export const ChatSessionItem = ({ session, loading, onClose }: Props) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { isAdmin } = useAuthContext();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const created = dayjs(session.date).locale('es');
    const closed = session.dateClose ? dayjs(session.dateClose).locale('es') : null;
    const status = session.dateClose ? statusMap.CERRADA : statusMap.ABIERTA;
    const isClosed = !!session.dateClose;

    const [propertyTitle, setPropertyTitle] = useState<string | null>(null);

    useEffect(() => {
        const fetchTitle = async () => {
            if (session.propertyId) {
                try {
                    const res = await getPropertyById(session.propertyId);
                    setPropertyTitle(res.title);
                } catch {
                    setPropertyTitle(null);
                }
            }
        };
        fetchTitle();
    }, [session.propertyId]);

    // Contact information
    const ContactInfo = (
        <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
            <Typography variant="body2">
                <strong>Usuario:</strong> {session.firstName} {session.lastName}
            </Typography>
            <Typography variant="body2">
                <strong>Email:</strong> {session.email}
            </Typography>
            {session.phone && (
                <Typography variant="body2">
                    <strong>Teléfono:</strong> {session.phone}
                </Typography>
            )}
        </Box>
    );

    // Título, Divider y propiedades consultadas
    const PropertyInfo = (
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={1}>
            {/* Título fijo para chat */}
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                <strong>Título:</strong> Consulta via ChatBot
            </Typography>
            {/* Divider vertical */}
            <Divider orientation="vertical" flexItem sx={{ bgcolor: theme.palette.grey[300] }} />
            {/* Propiedades consultadas o nota general */}
            {session.propertyId ? (
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                        <strong>Propiedad consultada:</strong>
                    </Typography>
                    <Chip
                        label={propertyTitle ? propertyTitle : `ID: ${session.propertyId}`}
                        size="small"
                        clickable
                        onClick={() => navigate(buildRoute(ROUTES.PROPERTY_DETAILS, session.propertyId))}
                        sx={{ cursor: 'pointer' }}
                    />
                    {session.derived && (
                        <Chip label="Derivada" color="secondary" size="small" />
                    )}
                </Box>
            ) : (
                <Typography variant="body2">
                    <strong>Consulta general</strong>
                </Typography>
            )}
        </Box>
    );

    // Date boxes
    const CreatedBox = (
        <Typography variant="body2">
            <strong>Fecha de inicio:</strong> {created.format('D [de] MMM YYYY, HH:mm')}
        </Typography>
    );
    const ClosedBox = (
        <Typography variant="body2">
            <strong>Fecha de cierre:</strong> {closed ? closed.format('D [de] MMM YYYY, HH:mm') : '-'}
        </Typography>
    );

    // Status chip
    const StatusChip = (
        <Chip label={status.label} size="small" color="primary" variant="outlined" />
    );

    // Action button for admin
    const ActionButton = isClosed ? (
        <LoadingButton size="small" variant="outlined" disabled>
            Resuelta
        </LoadingButton>
    ) : (
        <LoadingButton
            size="small"
            variant="outlined"
            loading={loading}
            onClick={() => onClose(session.id)}
        >
            Cerrar chat
        </LoadingButton>
    );

    return (
        <Card variant="outlined" sx={{ p: 2 }}>
            {isAdmin && PropertyInfo}
            {isAdmin && <Divider sx={{ mb: 2 }} />}

            {isMobile ? (
                <Box display="flex" flexDirection="column" gap={2}>
                    {CreatedBox}
                    {ClosedBox}
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        {!isAdmin && StatusChip}
                    </Box>
                    {isAdmin && (
                        <Box display="flex" justifyContent="flex-end">
                            {ActionButton}
                        </Box>
                    )}
                </Box>
            ) : (
                <Box display="flex" alignItems="center">
                    <Box sx={{ minWidth: 200, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {CreatedBox}
                        {ClosedBox}
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ mx: 3, bgcolor: theme.palette.grey[300] }} />
                    <Box flex={1}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            {!isAdmin && StatusChip}
                        </Box>
                    </Box>
                    {isAdmin && <Box ml={3}>{ActionButton}</Box>}
                </Box>
            )}

            {isAdmin && <Divider sx={{ mt: 2 }} />}
            {ContactInfo}
        </Card>
    );
};
