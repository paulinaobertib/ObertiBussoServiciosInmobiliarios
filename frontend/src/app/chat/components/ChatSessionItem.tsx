import React from 'react';
import { Box, Card, Typography, Chip, Divider, useTheme, useMediaQuery } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import type { ChatSessionGetDTO } from '../types/chatSession';
import { useAuthContext } from '../../user/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { buildRoute, ROUTES } from '../../../lib';

interface Props {
    session: ChatSessionGetDTO;
    loading: boolean;
    onClose: (id: number) => void;
    propertyTitle?: string;
}

export const ChatSessionItem = React.memo(({ session, propertyTitle }: Props) => {
    const theme = useTheme();
    const navigate = useNavigate();
    useAuthContext();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const created = dayjs(session.date).locale('es');

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
                        onClick={() => navigate(buildRoute(ROUTES.PROPERTY_DETAILS, session.propertyId))}
                        sx={{ cursor: 'pointer', maxWidth: 200, textOverflow: 'ellipsis', overflow: 'hidden' }}
                    />
                </Box>
            ) : (
                <Typography variant="body2"><strong>Consulta general</strong></Typography>
            )}
        </Box>
    );

    const ContactInfo = (
        <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
            <Typography variant="body2"><strong>Usuario:</strong> {session.firstName} {session.lastName}</Typography>
            <Typography variant="body2"><strong>Email:</strong> {session.email}</Typography>
            {session.phone && <Typography variant="body2"><strong>Teléfono:</strong> {session.phone}</Typography>}
        </Box>
    );

    return (
        <Card variant="outlined" sx={{ p: 2 }}>
            {PropertyInfo}
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2"><strong>Fecha de consulta:</strong> {created.format('D [de] MMM YYYY, HH:mm')}</Typography>
            {isMobile ? (
                <Box display="flex" flexDirection="column" gap={2} />
            ) : (
                <Box display="flex" alignItems="center" />
            )}
            <Divider sx={{ mt: 2 }} />
            {ContactInfo}
        </Card>
    );
});