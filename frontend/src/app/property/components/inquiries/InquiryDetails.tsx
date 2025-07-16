import { Box, Typography, Button } from '@mui/material';
import type { Inquiry } from '../../types/inquiry';

interface Props {
    inquiry: Inquiry;
    relatedProps: { id: number; title: string }[];
    onClose: () => void;
    onNavigate: (propId: number) => void;
}

export const InquiryDetail = ({
    inquiry,
    relatedProps,
    onNavigate,
}: Props) => (
    <Box sx={{ p: 2, display: 'grid', gap: 1 }}>
        <Typography><strong>Usuario:</strong> {inquiry.firstName} {inquiry.lastName}</Typography>
        <Typography><strong>Contacto:</strong> {inquiry.email} | {inquiry.phone}</Typography>
        <Typography><strong>Título:</strong> {inquiry.title}</Typography>
        <Typography><strong>Descripción:</strong> {inquiry.description}</Typography>
        <Typography><strong>Estado:</strong> {inquiry.status}</Typography>

        {relatedProps.length > 0 && (
            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: .5 }}>
                    Propiedades:
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                    {relatedProps.map(p => (
                        <Box
                            key={p.id}
                            component="li"
                            sx={{ display: 'flex', alignItems: 'center', mb: .5 }}
                        >
                            <Typography component="span" sx={{ mr: 1 }}>–</Typography>
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => onNavigate(p.id)}
                                sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
                            >
                                {p.title}
                            </Button>
                        </Box>
                    ))}
                </Box>
            </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography color="text.secondary">
                Creada: {new Date(inquiry.date).toLocaleString()}
            </Typography>
            {inquiry.status === 'CERRADA' && inquiry.dateClose && (
                <Typography color="text.secondary">
                    Cerrada: {new Date(inquiry.dateClose).toLocaleString()}
                </Typography>
            )}
        </Box>
    </Box>
);
