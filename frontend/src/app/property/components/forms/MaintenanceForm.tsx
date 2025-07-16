import { Grid, TextField, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useCategories } from '../../hooks/useCategories';
import { usePropertiesContext } from '../../context/PropertiesContext';
import { postMaintenance, putMaintenance, deleteMaintenance, } from '../../services/maintenance.service';
import { Maintenance, MaintenanceCreate, } from '../../types/maintenance';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Maintenance;
    onDone: () => void;
}

export const MaintenanceForm = ({ action, item, onDone }: Props) => {
    const { refreshMaintenances, pickedItem } = usePropertiesContext();

    const { form, setForm, invalid, run, loading } = useCategories(
        {
            id: item?.id ?? 0,
            propertyId: item?.propertyId ?? (pickedItem?.type === 'property' ? pickedItem.value?.id ?? 0 : 0),
            title: item?.title ?? '',
            description: item?.description ?? '',
            date: item?.date ?? '',
        },
        action,
        async payload => {
            if (action === 'add') return postMaintenance(payload as MaintenanceCreate);
            if (action === 'edit') return putMaintenance(payload as Maintenance);
            if (action === 'delete') return deleteMaintenance(payload as Maintenance);
        },
        refreshMaintenances,
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
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Título"
                        size="small"
                        disabled={action === 'delete'}
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        type="datetime-local"
                        label="Fecha"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        disabled={action === 'delete'}
                        value={form.date}
                        onChange={e => setForm({ ...form, date: e.target.value })}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Descripción"
                        size="small"
                        disabled={action === 'delete'}
                        value={form.description}
                        onChange={e =>
                            setForm({ ...form, description: e.target.value })
                        }
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
