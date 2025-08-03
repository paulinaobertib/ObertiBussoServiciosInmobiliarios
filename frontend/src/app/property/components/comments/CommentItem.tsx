import { Box, Typography, IconButton, Tooltip, Chip, Divider, Card } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Comment } from '../../types/comment';

export interface Props {
    comment: Comment;
    onEdit: () => void;
    onDelete: () => void;
}

export const CommentItem = ({ comment, onEdit, onDelete }: Props) => {
    const date = new Date(comment.date);
    const isNew = Date.now() - date.getTime() < 3 * 24 * 60 * 60 * 1000;

    return (
        <Card variant='elevation' sx={{ p: 2 }} >
            <Box display="flex" alignItems="center" justifyContent={'space-between'}>
                <Box>
                    <Typography variant="subtitle1">
                        Creado por: <strong>Usuario Administrador</strong>
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
                {comment.description}
            </Typography>
        </Card>
    );
};
