import { useState } from 'react';
import { TextField, Box, Button, FormControlLabel, Checkbox } from '@mui/material';
import { Type, TypeCreate } from '../../types/type';
import { postType, putType, deleteType } from '../../services/type.service';
import { usePropertyCrud } from '../../context/PropertyCrudContext';
import { useGlobalAlert } from '../../context/AlertContext';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Type;
    onDone: () => void;
}

export default function TypeForm({ action, item, onDone }: Props) {
    const { refresh } = usePropertyCrud();
    const [name, setName] = useState(item?.name ?? '');
    const { showAlert } = useGlobalAlert();

    const invalid = action !== 'delete' && name.trim() === '';

    const [hasBedrooms, setHasBedrooms] = useState(true);
    const [hasBathrooms, setHasBathrooms] = useState(true);
    const [hasRooms, setHasRooms] = useState(true);

    const save = async () => {
        try {
            if (action === 'add') {
                await postType({ name } as TypeCreate);
                showAlert('Tipo de propiedad creado con éxito!', 'success');
            }
            if (action === 'edit' && item) {
                await putType({ ...item, name });
                showAlert('Tipo de propiedad editado con éxito!', 'success');
            }
            if (action === 'delete' && item) {
                await deleteType(item);
                showAlert('Tipo de propiedad eliminado con éxito!', 'success');
            }
            await refresh();
            onDone();

        } catch {
            showAlert('Error al trabajar con el tipo de propiedad', 'error');
        }
    };

    return (
        <>
            <TextField
                fullWidth
                label="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={action === 'delete'}
                sx={{ mb: 2 }}
            />

            <FormControlLabel
                control={<Checkbox checked={hasRooms} onChange={(e) => setHasRooms(e.target.checked)} />}
                label="Ambientes"
                disabled={action === 'delete'}
            />
            <FormControlLabel
                control={<Checkbox checked={hasBedrooms} onChange={(e) => setHasBedrooms(e.target.checked)} />}
                label="Dormitorios"
                disabled={action === 'delete'}
            />
            <FormControlLabel
                control={<Checkbox checked={hasBathrooms} onChange={(e) => setHasBathrooms(e.target.checked)} />}
                label="Baños"
                disabled={action === 'delete'}
            />

            <Box textAlign="right">
                <Button
                    variant="contained"
                    onClick={save}
                    disabled={invalid}
                    color={action === 'delete' ? 'error' : 'primary'}
                >
                    {action === 'delete' ? 'Eliminar' : 'Confirmar'}
                </Button>
            </Box>
        </>
    );
}