import { useState } from 'react';
import { TextField, Grid, Box, Button } from '@mui/material';
import { Owner, OwnerCreate } from '../../types/owner';
import { postOwner, putOwner, deleteOwner } from '../../services/owner.service';
import { usePropertyCrud } from '../../context/PropertyCrudContext';
import { useGlobalAlert } from '../../context/AlertContext';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Owner;
    onDone: () => void;
}

export default function OwnerForm({ action, item, onDone }: Props) {
    const { refresh } = usePropertyCrud();
    const { showAlert } = useGlobalAlert();

    const [form, setForm] = useState<Owner>({
        id: item?.id ?? 0,
        firstName: item?.firstName ?? '',
        lastName: item?.lastName ?? '',
        mail: item?.mail ?? '',
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

            await refresh();
            onDone();
        } catch {
            showAlert('Error al trabajar con el propietario', 'error');
        }
    };

    return (
        <>

            <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 6 }}><TextField disabled={action === 'delete'} fullWidth label="Nombre" value={form.firstName} onChange={set('firstName')} /></Grid>
                <Grid size={{ xs: 6 }}><TextField disabled={action === 'delete'} fullWidth label="Apellido" value={form.lastName} onChange={set('lastName')} /></Grid>
                <Grid size={{ xs: 6 }}><TextField disabled={action === 'delete'} fullWidth label="Mail" value={form.mail} onChange={set('mail')} /></Grid>
                <Grid size={{ xs: 6 }}><TextField disabled={action === 'delete'} fullWidth label="Teléfono" value={form.phone} onChange={set('phone')} /></Grid>
            </Grid>


            <Box textAlign="right">
                <Button variant="contained" onClick={save} disabled={invalid} color={action === 'delete' ? 'error' : 'primary'}>
                    {action === 'delete' ? 'Eliminar' : 'Confirmar'}
                </Button>
            </Box>
        </>
    );
}

