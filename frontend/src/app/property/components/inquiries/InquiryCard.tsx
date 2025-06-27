import { useState } from 'react';
import { Box, Typography, Chip, Stack, Button, useTheme } from '@mui/material';
import { Inquiry } from '../../types/inquiry';
import { updateInquiry } from '../../services/inquiry.service';

interface InquiryCardProps {
    inquiry: Inquiry;
    isAdmin?: boolean;
    onStatusUpdated?: () => void;
    onSelect?: (inquiry: Inquiry) => void; // callback al seleccionar
}

export default function InquiryCard({
    inquiry,
    isAdmin = false,
    onStatusUpdated,
    onSelect,
}: InquiryCardProps) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const handleClose = async () => {
        if (!isAdmin || inquiry.status === 'CERRADA') return;
        setLoading(true);
        try {
            await updateInquiry(inquiry.id);
            onStatusUpdated?.();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            onClick={() => onSelect?.(inquiry)}
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
                minHeight: 200,
            }}
        >
            {/* Status chip */}
            <Chip
                label={inquiry.status}
                size="small"
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor:
                        inquiry.status === 'CERRADA'
                            ? theme.palette.grey[400]
                            : theme.palette.primary.main,
                    color: theme.palette.getContrastText(
                        inquiry.status === 'CERRADA'
                            ? theme.palette.grey[400]
                            : theme.palette.primary.main
                    ),
                }}
            />

            {/* Título y metadatos */}
            <Typography variant="subtitle2" color="text.secondary">
                Consulta #{inquiry.id}
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                {inquiry.title}
            </Typography>

            {/* Propiedades asociadas */}
            {inquiry.propertyTitles && inquiry.propertyTitles.length > 0 && (
                <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }}>
                    {inquiry.propertyTitles.map(p => (
                        <Chip key={p} label={p} sx={{ bgcolor: theme.palette.quaternary.main }} />
                    ))}
                </Stack>
            )}

            {/* Descripción */}
            <Typography variant="body2" sx={{ mt: 1, flexGrow: 1 }}>
                {inquiry.description}
            </Typography>

            {/* Fechas y acciones */}
            <Box
                sx={{
                    mt: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    Creada: {new Date(inquiry.date).toLocaleDateString()}
                </Typography>

                {inquiry.status === 'CERRADA' && inquiry.dateClose ? (
                    <Typography variant="caption" color="text.secondary">
                        Cerrada: {new Date(inquiry.dateClose).toLocaleDateString()}
                    </Typography>
                ) : isAdmin && inquiry.status !== 'CERRADA' ? (
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={event => {
                            event.stopPropagation();
                            handleClose();
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Cerrando...' : 'Marcar cerrada'}
                    </Button>
                ) : null}
            </Box>
        </Box>
    );
}
