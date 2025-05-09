import { useState } from 'react';
import { TextField, Box, Button } from '@mui/material';
import { Amenity, AmenityCreate } from '../../types/amenity';
import { postAmenity, putAmenity, deleteAmenity } from '../../services/amenity.service';
import { usePropertyCrud } from '../../context/PropertyCrudContext';
import { useGlobalAlert } from '../../context/AlertContext';

interface Props {
    action: 'add' | 'delete' | 'edit';
    item?: Amenity;
    onDone: () => void;
}

export default function AmenityForm({ action, item, onDone }: Props) {
    const { refresh } = usePropertyCrud();
    const [name, setName] = useState(item?.name ?? '');
    const { showAlert } = useGlobalAlert();

    const invalid = action !== 'delete' && name.trim() === '';

    const save = async () => {
        try {
            if (action === 'add') {
                await postAmenity({ name } as AmenityCreate)
                showAlert('¡Servicio creado con éxito!', 'success');;
            }
            if (action === 'edit' && item) {
                await putAmenity({ ...item!, name });
                showAlert('¡Servicio editado con éxito!', 'success');;
            }
            if (action === 'delete' && item) {
                await deleteAmenity(item!);
                showAlert('¡Servicio eliminado con éxito!', 'success');;
            }
            await refresh();
            onDone();
        } catch {
            showAlert('Error al trabajar con el servicio', 'error');
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
    )
}
