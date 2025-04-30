import { useState, useEffect } from 'react';
import { postProperty } from '../services/propertyService';
import { useCRUD } from '../context/CRUDContext';
import { Box, Button, TextField, Snackbar, Alert, MenuItem } from '@mui/material';
import { getErrorStyles } from '../utils/errorStyle';

const PropertyForm = () => {
    const { selectedCategories } = useCRUD();

    // Estado inicial del formulario
    const [formData, setFormData] = useState<any>({
        title: '',
        street: '',
        number: '',
        rooms: null,
        bathrooms: null,
        bedrooms: null,
        area: null,
        price: null,
        description: '',
        status: '',
        operation: '',
        currency: '',
        ownerId: selectedCategories.owner || null,
        neighborhoodId: selectedCategories.neighborhood || null,
        typeId: selectedCategories.type || null,
        amenitiesIds: selectedCategories.amenities || [],
        mainImage: null,
        images: [],
    });
    // const [formData, setFormData] = useState<any>({
    //     title: 'Propiedad sin título', // Título predeterminado
    //     street: 'Calle Ficticia', // Calle predeterminada
    //     number: '123', // Número predeterminado
    //     rooms: 3, // Número de habitaciones predeterminado
    //     bathrooms: 2, // Número de baños predeterminado
    //     bedrooms: 3, // Número de dormitorios predeterminado
    //     area: 100, // Área predeterminada (en metros cuadrados)
    //     price: 150000, // Precio predeterminado (en la moneda elegida)
    //     description: 'Descripción de la propiedad', // Descripción predeterminada
    //     status: 'DISPONIBLE', // Estado predeterminado (puede ser DISPONIBLE, VENDIDA, etc.)
    //     operation: 'VENTA', // Tipo de operación predeterminado (VENTA o ALQUILER)
    //     currency: 'USD', // Moneda predeterminada (puede ser USD o ARG)
    //     ownerId: 1, // Propietario predeterminado (suponiendo ID 1 como ejemplo)
    //     neighborhoodId: 1, // Barrio predeterminado (suponiendo ID 1 como ejemplo)
    //     typeId: 1, // Tipo de propiedad predeterminado (suponiendo ID 1 como ejemplo)
    //     amenitiesIds: [1, 2], // Servicios predeterminados (puedes poner algunos ID de ejemplo)
    //     mainImage: null, // Imagen principal predeterminada (inicialmente sin imagen)
    //     images: [], // Imágenes adicionales (inicialmente sin imágenes)
    // });

    // Errores de validación
    const [errors, setErrors] = useState({
        title: false,
        street: false,
        number: false,
        rooms: false,
        bathrooms: false,
        bedrooms: false,
        area: false,
        price: false,
        description: false,
        status: false,
        operation: false,
        currency: false,

    });

    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

    // Actualiza formData cuando selectedCategories cambia
    useEffect(() => {
        setFormData({
            ...formData,
            ownerId: selectedCategories.owner || null,
            neighborhoodId: selectedCategories.neighborhood || null,
            typeId: selectedCategories.type || null,
            amenitiesIds: selectedCategories.amenities || [],
        });
    }, [selectedCategories]);

    // Maneja el cambio en los campos del formulario
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (value.trim() === '') {
            setErrors(prev => ({ ...prev, [name]: true }));
        } else {
            setErrors(prev => ({ ...prev, [name]: false }));
        }
    };

    // Valida los campos del formulario
    const validateForm = () => {
        const newErrors = {
            title: formData.title.trim() === '',
            street: formData.street.trim() === '',
            number: formData.number.trim() === '',
            rooms: formData.rooms == null || formData.rooms <= 0,
            bathrooms: formData.bathrooms == null || formData.bathrooms <= 0,
            bedrooms: formData.bedrooms == null || formData.bedrooms <= 0,
            area: formData.area == null || formData.area <= 0,
            price: formData.price <= 0,
            description: formData.description.trim() === '',
            status: !formData.status,
            operation: !formData.operation,
            currency: !formData.currency,
        };
        setErrors(newErrors);
        return Object.values(newErrors).some(error => error);
    };

    // Maneja el cambio en las imágenes
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);

            // Imprimir detalles de la imagen en la consola
            const file = selectedFiles[0];  // Solo toma la primera imagen seleccionada

            console.log("Nombre del archivo:", file.name); // Nombre de la imagen
            console.log("Tipo de archivo:", file.type); // Tipo MIME (ej. image/jpeg, image/png)
            console.log("Tamaño del archivo:", file.size); // Tamaño del archivo en bytes
            console.log("Última modificación:", file.lastModified); // Fecha de la última modificación del archivo

            // Si necesitas información sobre la imagen como su tamaño en kilobytes o megabytes:
            console.log("Tamaño en KB:", (file.size / 1024).toFixed(2)); // Convertir a KB
            console.log("Tamaño en MB:", (file.size / (1024 * 1024)).toFixed(2)); // Convertir a MB


            setFormData({
                ...formData,
                mainImage: selectedFiles[0],  // La primera imagen será la principal
                images: selectedFiles.slice(1),  // Las siguientes serán adicionales
            });
        }
    };

    // Maneja el envío del formulario
    const handleSubmit = async () => {
        if (validateForm()) { setErrorSnackbarOpen(true); return; }

        try {
            await postProperty(formData);     // 👈 enviar objeto JS, NO FormData
            setSuccessSnackbarOpen(true);
        } catch (err) {
            console.error('Error creando propiedad:', err);
            setErrorSnackbarOpen(true);
        }
    };

    return (
        <>
            <Box display="flex" flexDirection="column" gap={1.5} mt={2}>

                <TextField
                    name="title"
                    label="Título"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={errors.title}
                    fullWidth
                    size="small"
                    sx={getErrorStyles(errors.title)}
                />
                <TextField
                    name="description"
                    label="Descripción"
                    value={formData.description}
                    onChange={handleInputChange}
                    error={errors.description}
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    sx={getErrorStyles(errors.description)}
                />

                <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                        name="street"
                        label="Calle"
                        value={formData.street}
                        onChange={handleInputChange}
                        error={errors.street}
                        fullWidth
                        size="small"
                        sx={getErrorStyles(errors.street)}
                    />
                    <TextField
                        name="number"
                        label="Número"
                        value={formData.number}
                        onChange={handleInputChange}
                        error={errors.number}
                        fullWidth
                        size="small"
                        sx={getErrorStyles(errors.street)}
                    />

                    <TextField
                        name="area"
                        label="Superficie (m²)"
                        value={formData.area || ''}
                        onChange={handleInputChange}
                        error={errors.area}
                        fullWidth
                        size="small"
                        sx={getErrorStyles(errors.area)}
                    />
                </Box>

                <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                        name="rooms"
                        label="Habitaciones"
                        value={formData.rooms}
                        onChange={handleInputChange}
                        error={errors.rooms}
                        fullWidth
                        size="small"
                        sx={getErrorStyles(errors.rooms)}
                    />
                    <TextField
                        name="bathrooms"
                        label="Baños"
                        value={formData.bathrooms || ''}
                        onChange={handleInputChange}
                        error={errors.bathrooms}
                        fullWidth
                        size="small"
                        sx={getErrorStyles(errors.bathrooms)}
                    />
                    <TextField
                        name="bedrooms"
                        label="Dormitorios"
                        value={formData.bedrooms || ''}
                        onChange={handleInputChange}
                        error={errors.bedrooms}
                        fullWidth
                        size="small"
                        sx={getErrorStyles(errors.bedrooms)}
                    />
                </Box>


                <Box display="flex" gap={4} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                        select
                        name="currency"
                        label="Moneda"
                        value={formData.currency}
                        onChange={handleInputChange}
                        error={errors.currency}
                        fullWidth
                        size="small"
                        sx={getErrorStyles(errors.currency)}
                    >
                        <MenuItem value="ARG">ARG</MenuItem>
                        <MenuItem value="USD">USD</MenuItem>
                    </TextField>
                    <TextField
                        name="price"
                        label="Precio"
                        value={formData.price || ''}
                        onChange={handleInputChange}
                        error={errors.price}
                        fullWidth
                        size="small"
                        sx={getErrorStyles(errors.price)}
                    />


                    <TextField
                        select
                        name="operation"
                        label="Operación"
                        value={formData.operation}
                        onChange={handleInputChange}
                        error={errors.operation}
                        fullWidth
                        size="small"
                        sx={getErrorStyles(errors.operation)}
                    >
                        <MenuItem value="VENTA">VENTA</MenuItem>
                        <MenuItem value="ALQUILER">ALQUILER</MenuItem>
                    </TextField>
                    <TextField
                        select
                        name="status"
                        label="Estado"
                        value={formData.status}
                        onChange={handleInputChange}
                        error={errors.status}
                        fullWidth
                        size="small"
                        sx={getErrorStyles(errors.status)}
                    >
                        <MenuItem value="DISPONIBLE">DISPONIBLE</MenuItem>
                        <MenuItem value="VENDIDA">VENDIDA</MenuItem>
                        <MenuItem value="ALQUILADA">ALQUILADA</MenuItem>
                        <MenuItem value="RESERVADA">RESERVADA</MenuItem>
                    </TextField>
                </Box>
                <TextField
                    type="file"
                    onChange={handleImageChange}
                    inputProps={{ multiple: true }}
                    fullWidth
                    size="small"
                />

                <Box display="flex" flexDirection="row" justifyContent="center" gap={4} flexWrap="wrap" mt={2}>
                    <Button variant="outlined" sx={{ width: '100%', maxWidth: '120px' }} onClick={() => console.log('Formulario cerrado')}>Cancelar</Button>
                    <Button variant="contained" sx={{ width: '100%', maxWidth: '120px' }} onClick={handleSubmit}>Confirmar</Button>
                </Box>
            </Box >

            {/* Snackbar de error */}
            < Snackbar open={errorSnackbarOpen} autoHideDuration={3000} onClose={() => setErrorSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="error" onClose={() => setErrorSnackbarOpen(false)}>Por favor completá todos los campos.</Alert>
            </Snackbar >

            {/* Snackbar de éxito */}
            < Snackbar open={successSnackbarOpen} autoHideDuration={3000} onClose={() => setSuccessSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="success" onClose={() => setSuccessSnackbarOpen(false)}>Acción realizada exitosamente.</Alert>
            </Snackbar >
        </>
    );
};

export default PropertyForm;
