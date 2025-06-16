import { useState } from 'react';
import { TextField, Box } from '@mui/material';
import { Amenity, AmenityCreate } from '../../types/amenity';
import { postAmenity, putAmenity, deleteAmenity } from '../../services/amenity.service';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { useGlobalAlert } from '../../context/AlertContext';
import { LoadingButton } from '@mui/lab';
import { useLoading } from '../../utils/useLoading';

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

            <TextField
                fullWidth
                label="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={action === 'delete'}
                sx={{ mb: 2 }}
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
    )
}
