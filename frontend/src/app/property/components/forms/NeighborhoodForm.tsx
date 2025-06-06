import { useState } from 'react';
import { TextField, Grid, Box, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { Neighborhood, NeighborhoodCreate, NeighborhoodType } from '../../types/neighborhood';
import { postNeighborhood, putNeighborhood, deleteNeighborhood } from '../../services/neighborhood.service';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { useGlobalAlert } from '../../context/AlertContext';

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

    return (
        <>

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
                <Button variant="contained" onClick={save} disabled={invalid} color={action === 'delete' ? 'error' : 'primary'}>
                    {action === 'delete' ? 'Eliminar' : 'Confirmar'}
                </Button>
            </Box>
        </>
    );
}

