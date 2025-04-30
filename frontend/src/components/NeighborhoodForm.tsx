import { useState, useEffect } from 'react';
import { deleteNeighborhood, postNeighborhood, putNeighborhood } from '../services/neighborhoodService';
import { useCRUD } from '../context/CRUDContext';
import { NeighborhoodType } from '../types/neighborhood';
import { Box, Button, TextField, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';

interface NeighborhoodFormProps {
    item: any;
    action: string | null;
    onClose: () => void;
}

const NeighborhoodForm = ({ item, action, onClose }: NeighborhoodFormProps) => {
    const { refreshData } = useCRUD();
    const [formData, setFormData] = useState({ id: null, name: '', city: '', type: '' });
    const [errors, setErrors] = useState({ name: false, city: false, type: false });
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

    useEffect(() => {
        if (action !== 'Agregar' && item) {
            setFormData({
                id: item.id || null,
                name: item.name || '',
                city: item.city || '',
                type: item.type || '',
            });
        }
    }, [item, action]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (value.trim() === '') {
            setErrors(prev => ({ ...prev, [name]: true }));
        } else {
            setErrors(prev => ({ ...prev, [name]: false }));
        }
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        if (!name) return;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {
            name: formData.name.trim() === '',
            city: formData.city.trim() === '',
            type: !formData.type,
        };
        setErrors(newErrors);
        return Object.values(newErrors).some(error => error);
    };

    const handleSubmit = async () => {
        if (action !== 'Borrar' && validateForm()) {
            // console.log("Formulario inválido, mostrando snackbar.");
            setErrorSnackbarOpen(true);
            return;
        }

        try {
            if (action === 'Agregar') {
                await postNeighborhood({
                    ...formData,
                    type: formData.type as NeighborhoodType,
                });

            } else if (action === 'Editar' && formData.id !== null) {
                await putNeighborhood({
                    ...formData,
                    type: formData.type as NeighborhoodType,
                });

            } else if (action === 'Borrar' && formData.id !== null) {
                await deleteNeighborhood({
                    ...formData,
                    type: formData.type as NeighborhoodType,
                });

            }
            await refreshData();
            setSuccessSnackbarOpen(true);
            onClose();

        } catch (error) {
            console.error('Error processing amenity:', error);
        }

    };

    return (
        <>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <TextField
                    name="name"
                    label="Nombre"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    helperText={errors.name ? 'Campo obligatorio' : ''}
                    disabled={action === 'Borrar'}
                />

                <TextField
                    name="city"
                    label="Ciudad"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={errors.city}
                    helperText={errors.city ? 'Campo obligatorio' : ''}
                    disabled={action === 'Borrar'}
                />

                <FormControl fullWidth disabled={action === 'Borrar'}>
                    <InputLabel id="type-label">Tipo</InputLabel>
                    <Select
                        labelId="type-label"
                        name="type"
                        value={formData.type}
                        onChange={handleSelectChange}  // Usamos handleSelectChange acá
                        label="Tipo"
                    >
                        <MenuItem value={NeighborhoodType.CERRADO}>Cerrado</MenuItem>
                        <MenuItem value={NeighborhoodType.SEMICERRADO}>Semi-cerrado</MenuItem>
                        <MenuItem value={NeighborhoodType.ABIERTO}>Abierto</MenuItem>
                    </Select>
                </FormControl>

                <Box display="flex" flexDirection="row" justifyContent="center" gap={4} flexWrap="wrap" mt={2}>
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

export default NeighborhoodForm;