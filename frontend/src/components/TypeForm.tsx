import { Box, Button, TextField, Snackbar, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { deleteType, postType, putType } from '../services/typeService';
import { useCRUD } from '../context/CRUDContext';

interface TypeFormProps {
    item: any;
    action: string | null;
    onClose: () => void;
}

const TypeForm = ({ item, action, onClose }: TypeFormProps) => {
    const { refreshData } = useCRUD();
    const [formData, setFormData] = useState({ id: null, name: '' });
    const [errors, setErrors] = useState({ name: false });
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

    useEffect(() => {
        if (action !== 'Agregar' && item) {
            setFormData({
                id: item.id || null,
                name: item.name || '',
            });
        }
    }, [item, action]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        if (e.target.value.trim() === '') {
            setErrors(prev => ({ ...prev, [e.target.name]: true }));
        } else {
            setErrors(prev => ({ ...prev, [e.target.name]: false }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            name: formData.name.trim() === '',
        };
        setErrors(newErrors);
        return Object.values(newErrors).some(error => error);
    };

    const handleSubmit = async () => {
        if (action !== 'Borrar' && validateForm()) {
            setErrorSnackbarOpen(true);
            return;
        }
        try {
            if (action === 'Agregar') {
                await postType(formData);
            } else if (action === 'Editar' && formData.id !== null) {
                await putType(formData);
            } else if (action === 'Borrar' && formData.id !== null) {
                await deleteType(formData);
            }

            await refreshData();
            setSuccessSnackbarOpen(true);

            onClose();
        } catch (error) {
            console.error('Error processing type:', error);
        }
    };

    return (
        <>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <TextField
                        name="name"
                        label="Nombre"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        helperText={errors.name ? 'Campo obligatorio' : ''}
                        disabled={action === 'Borrar'}
                    />
                </Box>

                <Box display="flex" flexDirection="row" justifyContent="center" gap={4} flexWrap="wrap">
                    <Button variant="outlined" onClick={onClose} sx={{ width: '100%', maxWidth: '120px' }}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ width: '100%', maxWidth: '120px' }}>
                        Confirmar
                    </Button>
                </Box>
            </Box>

            {/* Snackbar de error */}
            <Snackbar
                open={errorSnackbarOpen}
                autoHideDuration={3000}
                onClose={() => setErrorSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={() => setErrorSnackbarOpen(false)}>
                    Por favor completá todos los campos.
                </Alert>
            </Snackbar>

            {/* Snackbar de éxito */}
            <Snackbar
                open={successSnackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSuccessSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setSuccessSnackbarOpen(false)}>
                    Acción realizada exitosamente.
                </Alert>
            </Snackbar>
        </>
    );
};

export default TypeForm;
