import { useState } from 'react';
import {
    Grid, TextField, Box, Button,
} from '@mui/material';

import { usePropertyCrud } from '../../context/PropertiesContext';
import { useGlobalAlert } from '../../context/AlertContext';

import {
    postMaintenance,
    putMaintenance,
    deleteMaintenance,
} from '../../services/maintenance.service';      // ← nombre correcto

import {
    Maintenance,
    MaintenanceCreate,
} from '../../types/maintenance';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Maintenance;
    onDone: () => void;
}

export default function MaintenanceForm({ action, item, onDone }: Props) {
    const { refresh, pickedItem } = usePropertyCrud();
    const { showAlert } = useGlobalAlert();

    /* ---------- estado del formulario ---------- */
    const [form, setForm] = useState<Maintenance>({
        id: item?.id ?? 0,                 // ← ⬅️  ¡añadido!
        propertyId: item?.propertyId
            ?? (pickedItem?.type === 'property' ? pickedItem.value?.id ?? 0 : 0),
        title: item?.title ?? '',
        description: item?.description ?? '',
        date: item?.date ?? '',
    });

    /* helper genérico */
    const set =
        (k: keyof Maintenance) =>
            (e: React.ChangeEvent<HTMLInputElement>) =>
                setForm(f => ({ ...f, [k]: e.target.value }));

    /* validación simple */
    const invalid =
        action !== 'delete' &&
        (!form.propertyId || !form.title.trim() ||
            !form.description.trim() || !form.date);

    /* ---------- CRUD ---------- */
    const save = async () => {
        try {
            if (action === 'add') {
                await postMaintenance(form as MaintenanceCreate);
                showAlert('¡Mantenimiento creado!', 'success');
            }
            if (action === 'edit' && item) {
                await putMaintenance(form);
                showAlert('Mantenimiento actualizado', 'success');
            }
            if (action === 'delete' && item) {
                await deleteMaintenance(item);
                showAlert('Mantenimiento eliminado', 'success');
            }

            await refresh();
            onDone();
        } catch {
            showAlert('Error al trabajar con el mantenimiento', 'error');
        }
    };

    /* ---------- UI ---------- */
    return (
        <>
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
                <Button
                    variant="contained"
                    color={action === 'delete' ? 'error' : 'primary'}
                    disabled={invalid}
                    onClick={save}
                >
                    {action === 'delete' ? 'Eliminar' : 'Confirmar'}
                </Button>
            </Box>
        </>
    );
}
