import { Box, Typography, IconButton, Tooltip, Chip, Divider, Card } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Maintenance } from '../../types/maintenance';

export interface MaintenanceItemProps {
    maintenance: Maintenance;
    onEdit: () => void;
    onDelete: () => void;
}

export const MaintenanceItem = ({ maintenance, onEdit, onDelete }: MaintenanceItemProps) => {
    const date = new Date(maintenance.date);
    const isNew = Date.now() - date.getTime() < 3 * 24 * 60 * 60 * 1000;

    return (
        <Card variant='elevation' sx={{ p: 2 }} >
            <Box display="flex" alignItems="center" justifyContent={'space-between'}>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {maintenance.title}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        {date.toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}{' '}
                        · {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                </Box>
                <Box>
                    {isNew && <Chip label="Nuevo" color="primary" size="small" sx={{ mr: 1 }} />}
                    <Tooltip title="Editar">
                        <IconButton size="small" onClick={onEdit}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={onDelete}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                {maintenance.description}
            </Typography>
        </Card>
    );
};
