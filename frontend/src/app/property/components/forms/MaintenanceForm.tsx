import { useEffect } from 'react';
import { Grid, TextField, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useCategories } from '../../hooks/useCategories';
import {
    postMaintenance,
    putMaintenance,
    deleteMaintenance,
} from '../../services/maintenance.service';
import type { Maintenance, MaintenanceCreate } from '../../types/maintenance';

interface Props {
    /** El mismo propertyId de la sección */
    propertyId: number;
    action: 'add' | 'edit' | 'delete';
    item?: Maintenance;
    /** Refresca la lista tras POST/PUT/DELETE */
    refresh: () => Promise<void>;
    /** Resetea UI (sin volver a fetch completo) */
    onDone: () => void;
}

export const MaintenanceForm = ({
    propertyId,
    action,
    item,
    refresh,
    onDone,
}: Props) => {
    const initialPayload = {
        id: item?.id ?? 0,
        propertyId: propertyId,
        title: item?.title ?? '',
        description: item?.description ?? '',
        date: item?.date ?? '',
    };

    const { form, setForm, invalid, run, loading } = useCategories(
        initialPayload,
        action,
        async (payload) => {
            if (action === 'add') {
                const { id, ...createPayload } = payload as any;
                return postMaintenance(createPayload as MaintenanceCreate);
            }
            if (action === 'edit') return putMaintenance(payload as Maintenance);
            if (action === 'delete') return deleteMaintenance(payload as Maintenance);
        },
        refresh,
        onDone
    );

    useEffect(() => {
        if (action === 'edit' && item) {
            setForm({
                id: item.id,
                propertyId: propertyId,
                title: item.title,
                description: item.description,
                date: item.date,
            });
        } else {
            setForm(initialPayload);
        }
    }, [action, item?.id, propertyId, setForm]);

    const handleSubmit = async () => {
        await run();               // Ejecuta POST/PUT/DELETE y luego refresh()
        setForm(initialPayload);   // Limpia campos
        onDone();                  // Cambia UI a modo “add”
    };

    return (
        <Box component="form" noValidate>
            <Grid container spacing={1} mb={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Título"
                        size="small"
                        disabled={action === 'delete'}
                        value={form.title}
                        onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                        }
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
                        onChange={(e) =>
                            setForm({ ...form, date: e.target.value })
                        }
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Descripción"
                        size="small"
                        disabled={action === 'delete'}
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                    />
                </Grid>
            </Grid>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    mt: 2,
                }}
            >
                {/* Cancelar siempre disponible en modo edit */}
                {action === 'edit' && (
                    <LoadingButton
                        loading={loading}
                        onClick={() => {
                            setForm(initialPayload);
                            onDone();
                        }}
                        disabled={loading}
                    >
                        Cancelar
                    </LoadingButton>
                )}

                <LoadingButton
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={invalid || loading}
                    variant="contained"
                    color={action === 'delete' ? 'error' : 'primary'}
                >
                    {action === 'delete' ? 'Eliminar' : 'Confirmar'}
                </LoadingButton>
            </Box>
        </Box>
    );
};
