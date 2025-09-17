import { useEffect } from 'react';
import { Grid, TextField, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useCategories } from '../../hooks/useCategories';
import { useAuthContext } from '../../../user/context/AuthContext';
import {
    postComment,
    putComment,
    deleteComment,
} from '../../services/comment.service';
import type { Comment, CommentCreate } from '../../types/comment';

interface Props {
    propertyId: number;
    action: 'add' | 'edit' | 'delete';
    item?: Comment;
    refresh: () => Promise<void>;
    onDone: () => void;
}

export const CommentForm = ({ propertyId, action, item, refresh, onDone, }: Props) => {
    const { info } = useAuthContext();
    const initialPayload = {
        id: item?.id ?? 0,
        propertyId: propertyId,
        description: item?.description ?? '',
        date: item?.date ?? '',
        userId: item?.userId ?? info?.id ?? ''
    };

    const { form, setForm, run, loading } = useCategories<Comment>({
        initial: initialPayload,
        action,
        save: async (payload) => {
            if (action === 'add') {
                const toSend = { ...(payload as any), userId: info?.id ?? '' } as CommentCreate;
                return postComment(toSend);
            }
            if (action === 'edit') return putComment(payload as Comment);
            if (action === 'delete') return deleteComment(payload as Comment);
        },
        refresh,
        onDone,
    });

    useEffect(() => {
        if (action === 'edit' && item) {
            setForm({
                id: item.id,
                propertyId,
                description: item.description,
                date: item.date,
                userId: item.userId,
            });
        } else {
            // Para 'add', reforzamos el userId del usuario autenticado
            setForm(initialPayload);
        }
    }, [action, item?.id, propertyId, info?.id]);

    const handleSubmit = async () => {
        await run();
        setForm(initialPayload);
    };

    const handleCancel = () => {
        setForm(initialPayload);
        onDone();
    };

    return (
        <Box component="form" noValidate>
            <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={5}
                        label="Descripción"
                        size="small"
                        disabled={action === 'delete'}
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                    />
                </Grid>
            </Grid>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    mt: 2,
                }}
            >
                {/* Cancelar disponible en add y edit */}
                {(action === 'edit' || action === 'add') && (
                    <LoadingButton
                        loading={loading}
                        onClick={handleCancel}
                        disabled={
                            loading || form.description.trim() === ''
                        }
                    >
                        Cancelar
                    </LoadingButton>
                )}

                <LoadingButton
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={
                        loading ||
                        (action !== 'delete' && form.description.trim() === '')
                    }
                    variant="contained"
                    color={action === 'delete' ? 'error' : 'primary'}
                >
                    {action === 'delete' ? 'Eliminar' : 'Confirmar'}
                </LoadingButton>
            </Box>
        </Box>
    );
};
