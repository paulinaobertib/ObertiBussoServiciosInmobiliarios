import { Grid, TextField, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useCategories } from '../../hooks/useCategories';
import { usePropertiesContext } from '../../context/PropertiesContext';
import { Owner, OwnerCreate } from '../../types/owner';
import {
    postOwner,
    putOwner,
    deleteOwner,
} from '../../services/owner.service';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Owner;
    onDone: () => void;
}

export const OwnerForm = ({ action, item, onDone }: Props) => {
    /** context */
    const { refreshOwners } = usePropertiesContext();

    /** hook genérico */
    const { form, setForm, invalid, run, loading } = useCategories(
        {
            id: item?.id ?? 0,
            firstName: item?.firstName ?? '',
            lastName: item?.lastName ?? '',
            email: item?.email ?? '',
            phone: item?.phone ?? '',
        },
        action,
        async payload => {
            if (action === 'add') return postOwner(payload as OwnerCreate);
            if (action === 'edit') return putOwner(payload as Owner);
            if (action === 'delete') return deleteOwner(payload as Owner);
        },
        refreshOwners,
        onDone
    );

    return (
        <>
            {/* overlay de carga */}
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

            {/* campos */}
            <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Nombre"
                        disabled={action === 'delete'}
                        value={form.firstName}
                        onChange={e => setForm({ ...form, firstName: e.target.value })}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Apellido"
                        disabled={action === 'delete'}
                        value={form.lastName}
                        onChange={e => setForm({ ...form, lastName: e.target.value })}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Mail"
                        disabled={action === 'delete'}
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Teléfono"
                        disabled={action === 'delete'}
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                </Grid>
            </Grid>

            {/* botón confirmar / eliminar */}
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
