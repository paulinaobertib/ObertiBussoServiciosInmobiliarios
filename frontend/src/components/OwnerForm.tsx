import { Box, Button, TextField, Snackbar, Alert, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { deleteOwner, postOwner, putOwner } from '../services/ownerService';
import { useCRUD } from '../context/CRUDContext';

interface OwnerFormProps {
    item: any;
    action: string | null;
    onClose: () => void;
}

const OwnerForm = ({ item, action, onClose }: OwnerFormProps) => {
    const { refreshData } = useCRUD();
    const [formData, setFormData] = useState({ id: null, firstName: '', lastName: '', mail: '', phone: '' });
    const [errors, setErrors] = useState({ firstName: false, lastName: false, mail: false, phone: false });
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

    useEffect(() => {
        if (action !== 'Agregar' && item) {
            setFormData({
                id: item.id || null,
                firstName: item.firstName || '',
                lastName: item.lastName || '',
                mail: item.mail || '',
                phone: item.phone || '',
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
            firstName: formData.firstName.trim() === '',
            lastName: formData.lastName.trim() === '',
            mail: formData.mail.trim() === '',
            phone: formData.phone.trim() === '',
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
                await postOwner(formData);
            } else if (action === 'Editar' && formData.id !== null) {
                await putOwner(formData);
            } else if (action === 'Borrar' && formData.id !== null) {
                await deleteOwner(formData);
            }

            await refreshData();
            setSuccessSnackbarOpen(true);
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error processing owner:', error);
        }
    };

    return (
        <>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <TextField
                        name="firstName"
                        label="Nombre"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        helperText={errors.firstName ? 'Campo obligatorio' : ''}
                        disabled={action === 'Borrar'} // 👈 bloqueado si es borrar
                    />
                    <TextField
                        name="lastName"
                        label="Apellido"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        helperText={errors.lastName ? 'Campo obligatorio' : ''}
                        disabled={action === 'Borrar'}
                    />
                    <TextField
                        name="mail"
                        label="Mail"
                        value={formData.mail}
                        onChange={handleChange}
                        error={errors.mail}
                        helperText={errors.mail ? 'Campo obligatorio' : ''}
                        disabled={action === 'Borrar'}
                    />
                    <TextField
                        name="phone"
                        label="Teléfono"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        helperText={errors.phone ? 'Campo obligatorio' : ''}
                        disabled={action === 'Borrar'}
                    />
                </Box>

                <Box display="flex" flexDirection="row" justifyContent="center" gap={4}>
                    <Button variant="outlined" onClick={onClose}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSubmit}> Confirmar</Button>
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

export default OwnerForm;
