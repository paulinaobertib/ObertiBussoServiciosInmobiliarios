import { TextField, Box } from '@mui/material';
import { Amenity } from '../../types/amenity';
import { postAmenity, putAmenity, deleteAmenity } from '../../services/amenity.service';
import { usePropertiesContext } from '../../context/PropertiesContext';
import { LoadingButton } from '@mui/lab';
import { useCategories } from '../../hooks/useCategories';

interface Props {
    action: 'add' | 'delete' | 'edit';
    item?: Amenity;
    onDone: () => void;
}

export const AmenityForm = ({ action, item, onDone }: Props) => {
    const { refreshAmenities } = usePropertiesContext();
    const { form, setForm, invalid, run, loading } = useCategories(
        { id: item?.id ?? 0, name: item?.name ?? '' },
        action,
        async (payload) => {
            if (action === 'add') return postAmenity(payload);
            if (action === 'edit') return putAmenity(payload);
            if (action === 'delete') return deleteAmenity(payload);
        },
        refreshAmenities,
        onDone,
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
                >
                </Box>
            )}

            <TextField
                fullWidth
                label="Nombre"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={action === 'delete'}
                sx={{ mb: 2 }}
            />

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
    )
}
