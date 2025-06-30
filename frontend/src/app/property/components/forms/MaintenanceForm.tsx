import { useState } from 'react';
import { Grid, TextField, Box } from '@mui/material';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { useGlobalAlert } from '../../../shared/context/AlertContext';
import { postMaintenance, putMaintenance, deleteMaintenance, } from '../../services/maintenance.service';
import { Maintenance, MaintenanceCreate, } from '../../types/maintenance';
import { LoadingButton } from '@mui/lab';
import { useLoading } from '../../utils/useLoading';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Maintenance;
    onDone: () => void;
}

export const MaintenanceForm = ({ action, item, onDone }: Props) => {
    const { refreshMaintenances, pickedItem } = usePropertyCrud();
    const { showAlert } = useGlobalAlert();

    const [form, setForm] = useState<Maintenance>({
        id: item?.id ?? 0,
        propertyId: item?.propertyId
            ?? (pickedItem?.type === 'property' ? pickedItem.value?.id ?? 0 : 0),
        title: item?.title ?? '',
        description: item?.description ?? '',
        date: item?.date ?? '',
    });

    const set =
        (k: keyof Maintenance) =>
            (e: React.ChangeEvent<HTMLInputElement>) =>
                setForm(f => ({ ...f, [k]: e.target.value }));

    const invalid =
        action !== 'delete' &&
        (!form.propertyId || !form.title.trim() ||
            !form.description.trim() || !form.date);

    const save = async () => {
        try {
            if (action === 'add') {
                await postMaintenance(form as MaintenanceCreate);
                showAlert('Mantenimiento creado con éxito!', 'success');
            }
            if (action === 'edit' && item) {
                await putMaintenance(form);
                showAlert('Mantenimiento actualizado con éxito', 'success');
            }
            if (action === 'delete' && item) {
                await deleteMaintenance(item);
                showAlert('Mantenimiento eliminado con éxito', 'success');
            }

            await refreshMaintenances();
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

                <Grid size={6}>
                    <TextField
                        fullWidth size="small" label="Título"
                        value={form.title} onChange={set('title')}
                        disabled={action === 'delete'}
                    />
                </Grid>

                <Grid size={6}>
                    <TextField
                        fullWidth type="datetime-local" size="small"
                        label="Fecha"
                        InputLabelProps={{ shrink: true }}
                        value={form.date} onChange={set('date')}
                        disabled={action === 'delete'}
                    />
                </Grid>

                <Grid size={12}>
                    <TextField
                        fullWidth multiline rows={4} size="small"
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
