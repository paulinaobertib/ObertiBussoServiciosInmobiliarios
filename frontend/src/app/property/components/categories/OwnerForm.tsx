import { useState } from 'react';
import { TextField, Grid, Box } from '@mui/material';
import { Owner, OwnerCreate } from '../../types/owner';
import { postOwner, putOwner, deleteOwner } from '../../services/owner.service';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { useGlobalAlert } from '../../../shared/context/AlertContext';
import { LoadingButton } from '@mui/lab';
import { useLoading } from '../../utils/useLoading';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Owner;
    onDone: () => void;
}

export const OwnerForm = ({ action, item, onDone }: Props) => {
    const { refreshOwners } = usePropertyCrud();
    const { showAlert } = useGlobalAlert();

    const [form, setForm] = useState<Owner>({
        id: item?.id ?? 0,
        firstName: item?.firstName ?? '',
        lastName: item?.lastName ?? '',
        email: item?.email ?? '',
        phone: item?.phone ?? '',
    });

    const set = (k: keyof typeof form) => (e: any) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const invalid =
        action !== 'delete' &&
        Object.values(form).some((v) => typeof v === 'string' && v.trim() === '');

    const save = async () => {
        try {
            if (action === 'add') {
                await postOwner({ ...form } as OwnerCreate);
                showAlert('Propietario creado con éxito!', 'success');
            }
            if (action === 'edit' && item) {
                await putOwner(form);
                showAlert('Propietario editado con éxito!', 'success');
            }
            if (action === 'delete' && item) {
                await deleteOwner(form);
                showAlert('Propietario eliminado con éxito!', 'success');
            }

            await refreshOwners();
            onDone();
        } catch (error: any) {
            const message = error.response?.data ?? 'Error desconocido';
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
                <Grid size={{ xs: 6 }}><TextField disabled={action === 'delete'} fullWidth label="Nombre" value={form.firstName} onChange={set('firstName')} /></Grid>
                <Grid size={{ xs: 6 }}><TextField disabled={action === 'delete'} fullWidth label="Apellido" value={form.lastName} onChange={set('lastName')} /></Grid>
                <Grid size={{ xs: 6 }}><TextField disabled={action === 'delete'} fullWidth label="Mail" value={form.email} onChange={set('email')} /></Grid>
                <Grid size={{ xs: 6 }}><TextField disabled={action === 'delete'} fullWidth label="Teléfono" value={form.phone} onChange={set('phone')} /></Grid>
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

