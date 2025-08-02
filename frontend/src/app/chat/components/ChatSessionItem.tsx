// src/app/chat/components/InquiryChat.tsx
import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    Typography,
    Chip,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import type { ChatSessionGetDTO } from '../types/chatSession';
import { useAuthContext } from '../../user/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { buildRoute, ROUTES } from '../../../lib';
import { getPropertyById } from '../../property/services/property.service';

interface Props {
    session: ChatSessionGetDTO;
    loading: boolean;
    onClose: (id: number) => void;
}

export const ChatSessionItem = ({ session, loading, onClose }: Props) => {
    console.log('ChatSessionItem session:', session);

    const theme = useTheme();
    const navigate = useNavigate();
    useAuthContext();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const created = dayjs(session.date).locale('es');
    const closed = session.dateClose ? dayjs(session.dateClose).locale('es') : null;
    const isClosed = !!session.dateClose;

    const [propertyTitle, setPropertyTitle] = useState<string | null>(null);

    useEffect(() => {
        console.log('Fetching title for propertyId:', session.propertyId);
        if (!session.propertyId) return;
        (async () => {
            try {
                const res = await getPropertyById(session.propertyId);
                console.log('getPropertyById result:', res);
                setPropertyTitle(res.title);
            } catch (err) {
                console.error('Error fetching property title', err);
                setPropertyTitle(null);
            }
        })();
    }, [session.propertyId]);

    const PropertyInfo = (
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={1}>
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                <strong>Título:</strong> Consulta via ChatBot
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: theme.palette.grey[300] }} />
            {session.propertyId ? (
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                        <strong>Propiedad consultada:</strong>
                    </Typography>
                    <Chip
                        label={propertyTitle ?? `ID: ${session.propertyId}`}
                        size="small"
                        clickable
                        onClick={() =>
                            navigate(buildRoute(ROUTES.PROPERTY_DETAILS, session.propertyId))
                        }
                        sx={{
                            cursor: 'pointer',
                            maxWidth: 200,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                        }}
                    />
                </Box>
            ) : (
                <Typography variant="body2">
                    <strong>Consulta general</strong>
                </Typography>
            )}
        </Box>
    );

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

    const CreatedBox = (
        <Typography variant="body2">
            <strong>Fecha de inicio:</strong> {created.format('D [de] MMM YYYY, HH:mm')}
        </Typography>
    );
    const ClosedBox = (
        <Typography variant="body2">
            <strong>Fecha de cierre:</strong>{' '}
            {closed ? closed.format('D [de] MMM YYYY, HH:mm') : '-'}
        </Typography>
    );

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
            {PropertyInfo}
            <Divider sx={{ mb: 2 }} />

            {isMobile ? (
                <Box display="flex" flexDirection="column" gap={2}>
                    {CreatedBox}
                    {ClosedBox}
                    <Box display="flex" justifyContent="flex-end">{ActionButton}</Box>
                </Box>
            ) : (
                <Box display="flex" alignItems="center">
                    <Box
                        sx={{
                            minWidth: 200,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                        }}
                    >
                        {CreatedBox}
                        {ClosedBox}
                    </Box>
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ mx: 3, bgcolor: theme.palette.grey[300] }}
                    />
                    <Box
                        flex={1}
                        display="flex"
                        justifyContent="end"
                        alignItems="center"
                    >
                        {ActionButton}
                    </Box>
                </Box>
            )}

            <Divider sx={{ mt: 2 }} />
            {ContactInfo}
        </Card>
    );
};
