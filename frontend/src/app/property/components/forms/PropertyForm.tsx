import { Box, Grid, TextField, MenuItem, InputAdornment, IconButton, Typography } from '@mui/material';
import ImageUploader from '../ImageUploader';
import { usePropertyForm } from '../../hooks/usePropertyForm';
import { forwardRef, useImperativeHandle } from 'react';
import { usePropertyCrud } from '../../context/PropertyCrudContext';
import { useEffect } from 'react';
import { useImageHandlers } from '../../hooks/useImageHandlers';
import EditOffIcon from '@mui/icons-material/EditOff';

interface Props {
    onImageSelect?: (main: File | null, gallery: File[]) => void;
}

export type PropertyFormHandle = {
    submit: () => Promise<boolean>;
    reset: () => void;
    deleteImage: (f: File) => void;
};

const PropertyForm = forwardRef<PropertyFormHandle, Props>(
    ({ onImageSelect }, ref) => {

        const { handleMainImage, handleGalleryImages, deleteImage } = useImageHandlers();
        const { selected } = usePropertyCrud();
        const { form, setField, submit, reset, fieldErrors } = usePropertyForm();

        useImperativeHandle(ref, () => ({
            submit,
            reset,
            deleteImage: (f: File) => deleteImage(f, form, setField, onImageSelect)
        }));


        const num = (k: keyof typeof form) =>
            (e: React.ChangeEvent<HTMLInputElement>) =>
                setField(k as any, Number(e.target.value));

        const handleOptionalNumber = (field: keyof typeof form) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) || value === "S/N") {
                    setField(field, value);
                }
            };
        const handleMain = (f: File | null) => {
            handleMainImage(f, form, setField, onImageSelect);
        };

        const handleGallery = (files: File[]) => {
            handleGalleryImages(files, form, setField, onImageSelect);
        };

        useEffect(() => {
            setField('ownerId', selected.owner ?? 0);
        }, [selected.owner]);

        useEffect(() => {
            setField('neighborhoodId', selected.neighborhood ?? 0);
        }, [selected.neighborhood]);

        useEffect(() => {
            setField('typeId', selected.type ?? 0);
        }, [selected.type]);

        useEffect(() => {
            setField('amenitiesIds', selected.amenities);
        }, [selected.amenities]);

        return (
            <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <Grid container spacing={1.5} sx={{ flexGrow: 1 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="Título" value={form.title}
                            onChange={(e) => setField('title', e.target.value)} required
                            error={!!fieldErrors.title}
                        />
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <TextField fullWidth select label="Moneda" value={form.currency}
                            onChange={(e) => setField('currency', e.target.value)} required
                            error={!!fieldErrors.currency}
                        >
                            <MenuItem value="ARG">Peso Argentino</MenuItem>
                            <MenuItem value="USD">Dólar EE.UU</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <TextField fullWidth label="Precio" value={form.price === 0 ? "" : form.price}
                            onChange={num('price')} required
                            error={!!fieldErrors.price}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField fullWidth multiline rows={3} label="Descripción" value={form.description}
                            onChange={(e) => setField('description', e.target.value)} required
                            error={!!fieldErrors.description}
                        />
                    </Grid>

                    <Grid size={{ xs: 8 }}>
                        <TextField fullWidth label="Calle" value={form.street}
                            onChange={(e) => setField('street', e.target.value)} required
                            error={!!fieldErrors.street}
                        />
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                        <TextField
                            fullWidth
                            label="Número"
                            value={form.number}
                            onChange={(e) => setField('number', e.target.value)}
                            required
                            error={!!fieldErrors.number}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={() => setField('number', 'S/N')}
                                            title="Sin número"
                                        >
                                            <EditOffIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                        <TextField fullWidth label="Ambientes" value={form.rooms === 0 ? "" : form.rooms}
                            required
                            error={!!fieldErrors.rooms}

                            onChange={handleOptionalNumber('rooms')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={() => setField('rooms', 'S/N')}
                                            title="Sin número"
                                        >
                                            <EditOffIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                        <TextField fullWidth label="Dormitorios" value={form.bedrooms === 0 ? "" : form.bedrooms}
                            required
                            error={!!fieldErrors.bedrooms}
                            onChange={handleOptionalNumber('bedrooms')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={() => setField('bedrooms', 'S/N')}
                                            title="Sin número"
                                        >
                                            <EditOffIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                        <TextField fullWidth label="Baños" value={form.bathrooms === 0 ? "" : form.bathrooms}
                            required
                            error={!!fieldErrors.bathrooms}
                            onChange={handleOptionalNumber('bathrooms')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={() => setField('bathrooms', 'S/N')}
                                            title="Sin número"
                                        >
                                            <EditOffIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                        <TextField fullWidth label="Superficie m²" value={form.area === 0 ? "" : form.area}
                            error={!!fieldErrors.area}
                            onChange={num('area')} required />
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                        <TextField fullWidth select label="Estado" value={form.status}
                            error={!!fieldErrors.status}
                            onChange={(e) => setField('status', e.target.value)} required
                        >
                            <MenuItem value="DISPONIBLE">Disponible</MenuItem>
                            <MenuItem value="VENDIDA">Vendida</MenuItem>
                            <MenuItem value="ALQUILADA">Alquilada</MenuItem>
                            <MenuItem value="RESERVADA">Reservada</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                        <TextField
                            fullWidth select label="Operación" value={form.operation}
                            error={!!fieldErrors.operation}
                            onChange={(e) => setField('operation', e.target.value)} required
                        >
                            <MenuItem value="VENTA">Venta</MenuItem>
                            <MenuItem value="ALQUILER">Alquiler</MenuItem>
                        </TextField>
                    </Grid>

                    {/* imágenes */}
                    <Grid size={{ xs: 6 }}>
                        <ImageUploader
                            label="Cargar Imagen principal"
                            onSelect={(f) => handleMain(f[0])}
                        />
                        {fieldErrors.mainImage && (
                            <Typography variant="caption" color="error">
                                {fieldErrors.mainImage}
                            </Typography>
                        )}
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <ImageUploader label="Cargar Imágenes adicionales" multiple append
                            onSelect={(f) => handleGallery(Array.from(f))} />
                    </Grid>
                </Grid>
            </Box>
        );
    });
export default PropertyForm;