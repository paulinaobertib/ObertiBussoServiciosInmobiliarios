import { useState } from 'react';
import {
    Grid, TextField, Box, Button,
} from '@mui/material';

import { usePropertyCrud } from '../../context/PropertiesContext';
import { useGlobalAlert } from '../../context/AlertContext';

import {
    postComment,
    putComment,
    deleteComment,
} from '../../services/comment.service';

import {
    Comment,
    CommentCreate,
} from '../../types/comment';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Comment;
    onDone: () => void;
}

export default function CommentForm({ action, item, onDone }: Props) {
    const { refresh, pickedItem } = usePropertyCrud();
    const { showAlert } = useGlobalAlert();

    /* ---------- estado del formulario ---------- */
    const [form, setForm] = useState<Comment>({
        id: item?.id ?? 0,
        propertyId: item?.propertyId
            ?? (pickedItem?.type === 'property' ? pickedItem.value?.id ?? 0 : 0),
        description: item?.description ?? ''
    });

    /* helper genérico */
    const set =
        (k: keyof Comment) =>
            (e: React.ChangeEvent<HTMLInputElement>) =>
                setForm(f => ({ ...f, [k]: e.target.value }));

    /* validación simple */
    const invalid =
        action !== 'delete' &&
        (!form.propertyId || !form.description.trim());

    /* ---------- CRUD ---------- */
    const save = async () => {
        try {
            if (action === 'add') {
                await postComment(form as CommentCreate);
                showAlert('Comentario creado!', 'success');
            }
            if (action === 'edit' && item) {
                await putComment(form);
                showAlert('Comentario actualizado', 'success');
            }
            if (action === 'delete' && item) {
                await deleteComment(item);
                showAlert('Comentario eliminado', 'success');
            }

            await refresh();
            onDone();
        } catch {
            showAlert('Error al trabajar con el comentario', 'error');
        }
    };

    /* ---------- UI ---------- */
    return (
        <>
            <Grid container spacing={2} mb={2}>

                <Grid size={12}>
                    <TextField
                        fullWidth multiline rows={5} size="small"
                        label="Descripción"
                        value={form.description} onChange={set('description')}
                        disabled={action === 'delete'}
                    />
                </Grid>

            </Grid>

            <Box textAlign="right">
                <Button
                    variant="contained"
                    color={action === 'delete' ? 'error' : 'primary'}
                    disabled={invalid}
                    onClick={save}
                >
                    {action === 'delete' ? 'Eliminar' : 'Confirmar'}
                </Button>
            </Box>
        </>
    );
}
