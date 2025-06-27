import { useState } from 'react';
import { TextField, Box, FormControlLabel, Checkbox, Grid } from '@mui/material';
import { Type, TypeCreate } from '../../types/type';
import { postType, putType, deleteType } from '../../services/type.service';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { useGlobalAlert } from '../../../shared/context/AlertContext';

import { LoadingButton } from '@mui/lab';
import { useLoading } from '../../utils/useLoading';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Type;
    onDone: () => void;
}

export default function TypeForm({ action, item, onDone }: Props) {
    const { refreshTypes } = usePropertyCrud();
    const { showAlert } = useGlobalAlert();

    const [form, setForm] = useState<Type>({
        id: item?.id ?? 0,
        name: item?.name ?? '',
        hasRooms: item?.hasRooms ?? false,
        hasBathrooms: item?.hasBathrooms ?? false,
        hasBedrooms: item?.hasBedrooms ?? false,
        hasCoveredArea: item?.hasCoveredArea ?? false,
    });

    const set = (k: keyof typeof form) => (e: any) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const setBoolean = (key: keyof Type) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [key]: event.target.checked }));
    };

    const invalid =
        action !== 'delete' &&
        Object.values(form).some((v) => typeof v === 'string' && v.trim() === '');

    const save = async () => {
        try {
            if (action === 'add') {
                const { id, ...payload } = form;
                await postType(payload as TypeCreate);
                showAlert('Tipo de propiedad creado con éxito!', 'success');
            }
            if (action === 'edit' && item) {
                await putType(form);
                showAlert('Tipo de propiedad editado con éxito!', 'success');
            }
            if (action === 'delete' && item) {
                await deleteType(form);
                showAlert('Tipo de propiedad eliminado con éxito!', 'success');
            }

            await refreshTypes();
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

            <Grid size={6}>
                <TextField
                    fullWidth
                    label="Nombre"
                    value={form.name}
                    onChange={set('name')}
                    disabled={action === 'delete'}
                    sx={{ mb: 2 }}
                />
            </Grid>


            <FormControlLabel
                control={
                    <Checkbox
                        checked={form.hasRooms}
                        onChange={setBoolean('hasRooms')}
                    />
                }
                label="Ambientes"
                disabled={action === 'delete'}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={form.hasBedrooms}
                        onChange={setBoolean('hasBedrooms')}
                    />
                }
                label="Dormitorios"
                disabled={action === 'delete'}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={form.hasBathrooms}
                        onChange={setBoolean('hasBathrooms')}
                    />
                }
                label="Baños"
                disabled={action === 'delete'}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={form.hasCoveredArea}
                        onChange={setBoolean('hasCoveredArea')}
                    />
                }
                label="Superficie Cubierta"
                disabled={action === 'delete'}
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
    );
}
