import { useState } from 'react';
import { Grid, TextField, Box } from '@mui/material';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { useGlobalAlert } from '../../../shared/context/AlertContext';
import { postComment, putComment, deleteComment, } from '../../services/comment.service';
import { Comment, CommentCreate, } from '../../types/comment';
import { LoadingButton } from '@mui/lab';
import { useLoading } from '../../utils/useLoading';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Comment;
    onDone: () => void;
}

export const CommentForm = ({ action, item, onDone }: Props) => {
    const { refreshComments, pickedItem } = usePropertyCrud();
    const { showAlert } = useGlobalAlert();

    const [form, setForm] = useState<Comment>({
        id: item?.id ?? 0,
        propertyId: item?.propertyId
            ?? (pickedItem?.type === 'property' ? pickedItem.value?.id ?? 0 : 0),
        description: item?.description ?? ''
    });

    const set =
        (k: keyof Comment) =>
            (e: React.ChangeEvent<HTMLInputElement>) =>
                setForm(f => ({ ...f, [k]: e.target.value }));

    const invalid =
        action !== 'delete' &&
        (!form.propertyId || !form.description.trim());

    const save = async () => {
        try {
            if (action === 'add') {
                await postComment(form as CommentCreate);
                showAlert('Comentario creado con éxito!', 'success');
            }
            if (action === 'edit' && item) {
                await putComment(form);
                showAlert('Comentario actualizado con éxito', 'success');
            }
            if (action === 'delete' && item) {
                await deleteComment(item);
                showAlert('Comentario eliminado con éxito', 'success');
            }

            await refreshComments();
            onDone();
        } catch (error: any) {
            const message = error.response?.data ?? 'Error desconocido al trabajar con el comentario';
            showAlert(message, 'error');
        }
    };

    const { loading, run } = useLoading(save);
    return (
        <>
            {loading && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    zIndex={theme => theme.zIndex.modal + 1000}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                </Box>
            )}

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
                <LoadingButton
                    onClick={() => run()}
                    loading={loading}
                    disabled={invalid || loading}
                    variant="contained"
                    color={action === 'delete' ? 'error' : 'primary'}
                >
                    {action === 'delete' ? 'Eliminar' : 'Confirmar'}
                </LoadingButton>
            </Box>
        </>
    );
}
