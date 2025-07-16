import {
    Box, Typography, Button, useTheme,
} from '@mui/material';
import type { Inquiry } from '../../types/inquiry';

interface Props {
    inquiry: Inquiry;
    isAdmin: boolean;
    loading: boolean;
    onOpen: (inq: Inquiry) => void;
    onResolve: (id: number) => void;
}

export const InquiryItem = ({
    inquiry, isAdmin, loading, onOpen, onResolve,
}: Props) => {
    const theme = useTheme();
    const GRID = isAdmin ? '1.5fr 1fr 1fr 1fr' : '1.5fr 3fr 1fr';
    const pillColor = inquiry.status === 'ABIERTA'
        ? theme.palette.tertiary.main
        : theme.palette.quaternary.main;

    return (
        <Box
            key={inquiry.id}
            onClick={() => onOpen(inquiry)}
            sx={{
                display: { xs: 'block', sm: 'grid' },
                gridTemplateColumns: GRID,
                alignItems: 'center',
                px: 2, py: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
                cursor: 'pointer',
                '&:hover': { bgcolor: theme.palette.action.hover },
            }}
        >
            {/* col-1 - título + fecha */}
            <Box>
                <Typography>{inquiry.title}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {new Date(inquiry.date).toLocaleDateString()}
                </Typography>

            </Box>

            {/* col-2 */}
            {isAdmin
                ? <Typography noWrap>{inquiry.firstName} {inquiry.lastName}</Typography>
                : <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{inquiry.description}</Typography>}

            {/* col-3 – estado */}
            <Button
                variant="contained"
                size="small"
                sx={{
                    minWidth: 96,
                    bgcolor: pillColor,
                    color: theme.palette.getContrastText(pillColor),
                    pointerEvents: 'none',
                    justifySelf: 'end',
                }}
            >
                {inquiry.status}
            </Button>

            {/* col-4 – acción admin */}
            {isAdmin && (
                <Box
                    onClick={e => e.stopPropagation()}
                    sx={{ justifySelf: 'end' }}
                >
                    {inquiry.status === 'ABIERTA' ? (
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            disabled={loading}
                            onClick={() => onResolve(inquiry.id)}
                        >
                            Marcar resuelta
                        </Button>
                    ) : (
                        <Typography variant="body2" sx={{ minWidth: 120, textAlign: 'center', color: 'text.secondary' }}>
                            —
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};
