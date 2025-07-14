import {
    Box, Typography, IconButton, Tooltip, Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Define shape of maintenance data
export interface MaintenanceData {
    title: string;
    description: string;
    date: string;
}

// Props for the single item component
export interface MaintenanceItemProps {
    maintenance: MaintenanceData;
    onEdit: () => void;
    onDelete: () => void;
}

// Single maintenance item component
export const MaintenanceItem = ({ maintenance, onEdit, onDelete }: MaintenanceItemProps) => {
    const maintenanceDate = new Date(maintenance.date);
    const isNew = Date.now() - maintenanceDate.getTime() < 3 * 24 * 60 * 60 * 1000;

    return (
        <Box sx={{ display: 'flex', position: 'relative', mb: 4 }}>

            {/* Card content */}
            <Box
                sx={{
                    flex: 1,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 1,
                    position: 'relative',
                    transition: 'box-shadow 0.3s',
                    '&:hover': { boxShadow: 3 },
                }}
            >
                {/* Title row with optional "Nuevo" chip */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {maintenance.title}
                    </Typography>
                    {isNew && (
                        <Chip
                            label="Nuevo"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                        />
                    )}
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1,
                    }}
                >
                    {maintenance.description}
                </Typography>

                <Typography variant="caption" color="text.disabled">
                    {maintenanceDate.toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                </Typography>

                {/* Actions */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 1,
                    }}
                >
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
        </Box>
    );
};
