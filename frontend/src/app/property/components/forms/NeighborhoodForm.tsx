import { useState } from 'react';
import { TextField, Grid, Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { Neighborhood, NeighborhoodCreate, NeighborhoodType } from '../../types/neighborhood';
import { postNeighborhood, putNeighborhood, deleteNeighborhood } from '../../services/neighborhood.service';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { useGlobalAlert } from '../../context/AlertContext';
import { LoadingButton } from '@mui/lab';
import { useLoading } from '../../utils/useLoading';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Neighborhood;
    onDone: () => void;
}

export default function NeighborhoodForm({ action, item, onDone }: Props) {
    const { refresh } = usePropertyCrud();
    const { showAlert } = useGlobalAlert();

    const [form, setForm] = useState<Neighborhood>({
        id: item?.id ?? 0,
        name: item?.name ?? '',
        city: item?.city ?? '',
        type: item?.type ?? '',
    });

    const set = (k: keyof typeof form) => (e: any) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const invalid =
        action !== 'delete' &&
        Object.values(form).some((v) => typeof v === 'string' && v.trim() === '');

    const save = async () => {
        try {
            if (action === 'add') {
                await postNeighborhood({ ...form } as NeighborhoodCreate);
                showAlert('¡Barrio creado con éxito!', 'success');
            }
            if (action === 'edit' && item) {
                await putNeighborhood(form);
                showAlert('¡Barrio editado con éxito!', 'success');
            }
            if (action === 'delete' && item) {
                await deleteNeighborhood(item);
                showAlert('¡Barrio eliminado con éxito!', 'success');
            }

            await refresh();
            onDone();
        } catch {
            showAlert('Error al trabajar con el barrio', 'error');
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

            <Grid container spacing={2} mb={2} >
                <Grid size={6}>
                    <TextField disabled={action === 'delete'} fullWidth label="Nombre" value={form.name} onChange={set('name')} />
                </Grid>
                <Grid size={6}><TextField disabled={action === 'delete'} fullWidth label="Ciudad" value={form.city} onChange={set('city')} /></Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <InputLabel id="neighborhood-type-label">Tipo</InputLabel>
                        <Select
                            labelId="neighborhood-type-label"  // <-- agregar este
                            id="neighborhood-type"             // <-- agregar este
                            disabled={action === 'delete'}
                            value={form.type}
                            label="Tipo"
                            onChange={set('type')}
                        >
                            <MenuItem value={NeighborhoodType.CERRADO}>Cerrado</MenuItem>
                            <MenuItem value={NeighborhoodType.SEMICERRADO}>Semi cerrado</MenuItem>
                            <MenuItem value={NeighborhoodType.ABIERTO}>Abierto</MenuItem>
                        </Select>
                    </FormControl>
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

