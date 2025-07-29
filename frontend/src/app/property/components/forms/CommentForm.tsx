// src/app/property/components/forms/CommentForm.tsx
import { useEffect } from 'react';
import { Grid, TextField, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useCategories } from '../../hooks/useCategories';
import {
    postComment,
    putComment,
    deleteComment,
} from '../../services/comment.service';
import type { Comment, CommentCreate } from '../../types/comment';

interface Props {
    propertyId: number;         // <― recibimos el id
    action: 'add' | 'edit' | 'delete';
    item?: Comment;
    refresh: () => Promise<void>;
    onDone: () => void;
}

export const CommentForm = ({
    propertyId,
    action,
    item,
    refresh,
    onDone,
}: Props) => {
    const initialPayload = {
        id: item?.id ?? 0,
        propertyId: propertyId,      // <― usamos ese propertyId
        description: item?.description ?? '',
    };

    const { form, setForm, invalid, run, loading } = useCategories(
        initialPayload,
        action,
        async (payload) => {
            if (action === 'add') return postComment(payload as CommentCreate);
            if (action === 'edit') return putComment(payload as Comment);
            if (action === 'delete') return deleteComment(payload as Comment);
        },
        refresh,  // <― se llama UNA sola vez tras run()
        onDone
    );

    useEffect(() => {
        if (action === 'edit' && item) {
            setForm({
                id: item.id,
                propertyId,
                description: item.description,
            });
        } else {
            setForm(initialPayload);
        }
    }, [action, item?.id, propertyId, setForm]);

    const handleSubmit = async () => {
        await run();
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
                {/* Cancelar siempre disponible en modo edit */}
                {action === 'edit' && (
                    <LoadingButton
                        loading={loading}
                        onClick={() => {
                            setForm(initialPayload);
                            onDone();
                        }}
                        disabled={loading}
                    >
                        Cancelar
                    </LoadingButton>
                )}

                <LoadingButton
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={invalid || loading}
                    variant="contained"
                    color={action === 'delete' ? 'error' : 'primary'}
                >
                    {action === 'delete' ? 'Eliminar' : 'Confirmar'}
                </LoadingButton>
            </Box>
        </Box>
    );
};
