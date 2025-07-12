import { Grid, TextField, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useCategories } from '../../hooks/useCategories';
import { usePropertiesContext } from '../../context/PropertiesContext';
import { postComment, putComment, deleteComment, } from '../../services/comment.service';
import { Comment, CommentCreate } from '../../types/comment';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Comment;
    onDone: () => void;
}

export const CommentForm = ({ action, item, onDone }: Props) => {
    const { refreshComments, pickedItem } = usePropertiesContext();

    const { form, setForm, invalid, run, loading } = useCategories(
        {
            id: item?.id ?? 0,
            propertyId:
                item?.propertyId ??
                (pickedItem?.type === 'property' ? pickedItem.value?.id ?? 0 : 0),
            description: item?.description ?? '',
        },
        action,
        async payload => {
            if (action === 'add') return postComment(payload as CommentCreate);
            if (action === 'edit') return putComment(payload as Comment);
            if (action === 'delete') return deleteComment(payload as Comment);
        },
        refreshComments,
        onDone
    );

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
                />
            )}

            <Grid container spacing={2} mb={2}>
                <Grid size={{xs: 12}}>
                    <TextField
                        fullWidth
                        multiline
                        rows={5}
                        label="Descripción"
                        size="small"
                        disabled={action === 'delete'}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                </Grid>
            </Grid>

            <Box textAlign="right">
                <LoadingButton
                    onClick={run}
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
};
