import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import {
    Box, Grid, TextField, MenuItem, InputAdornment,
    IconButton, Typography, Checkbox, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';   // ← NUEVO
import { ImageUploader } from '../ImageUploader';
import { usePropertyForm } from '../../hooks/usePropertyForm';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { useImageHandlers } from '../../hooks/useImageHandlersCreate';
import { Property, PropertyCreate, PropertyUpdate } from '../../types/property';

export type PropertyFormHandle = {
    submit: () => Promise<boolean>;
    reset: () => void;
    deleteImage: (file: File) => void;
    setField: <K extends keyof Property>(key: K, value: Property[K]) => void;
    getCreateData: () => PropertyCreate;
    getUpdateData: () => PropertyUpdate;
};

interface Props {
    onImageSelect?: (main: string | File | null, gallery: (string | File)[]) => void;
    onValidityChange?: (valid: boolean) => void;
    initialData?: Property;
}

export const PropertyForm = forwardRef<PropertyFormHandle, Props>(
    ({ onImageSelect, onValidityChange, initialData }, ref) => {
        const { form, setField, submit, reset, fieldErrors, check, getCreateData, getUpdateData, } = usePropertyForm();
        const { selected, ownersList, neighborhoodsList, typesList, amenitiesList, } = usePropertyCrud();
        const { handleMainImage, handleGalleryImages, deleteImage } = useImageHandlers();

        useImperativeHandle(ref, () => ({
            submit,
            reset,
            deleteImage: (file: File) => deleteImage(file, form, setField, onImageSelect),
            setField: setField as any,
            getCreateData,
            getUpdateData,
        }));

        useEffect(() => {
            if (initialData) {
                Object.entries(initialData).forEach(([k, v]) => {
                    if (k in form) setField(k as keyof typeof form, v as any);
                });
            }
        }, [initialData]);

        // Sincronizar selects del contexto
        useEffect(() => {
            const o = ownersList.find(o => o.id === selected.owner);
            if (o && form.owner.id !== o.id) setField('owner', o);
        }, [selected.owner, ownersList]);

        useEffect(() => {
            const n = neighborhoodsList.find(n => n.id === selected.neighborhood);
            if (n && form.neighborhood.id !== n.id) setField('neighborhood', n);
        }, [selected.neighborhood, neighborhoodsList]);

        useEffect(() => {
            const t = typesList.find(t => t.id === selected.type);
            if (t && form.type.id !== t.id) setField('type', t);
        }, [selected.type, typesList]);

        useEffect(() => {
            const a = amenitiesList.filter(a => selected.amenities.includes(a.id));
            if (JSON.stringify(a.map(x => x.id)) !== JSON.stringify(form.amenities.map(x => x.id))) {
                setField('amenities', a);
            }
        }, [selected.amenities, amenitiesList]);

        // Campos variables según tipo
        const currentType = useMemo(
            () => typesList.find(t => t.id === selected.type),
            [selected.type, typesList]
        );

        const showRooms = currentType?.hasRooms ?? false;
        const showBedrooms = currentType?.hasBedrooms ?? false;
        const showBathrooms = currentType?.hasBathrooms ?? false;
        const showCoveredArea = currentType?.hasCoveredArea ?? false;
        const visibleRoomFields = [showRooms, showBedrooms, showBathrooms].filter(Boolean).length;
        const colSize = visibleRoomFields === 1 ? 12 : visibleRoomFields === 2 ? 6 : 4;

        // Avisar validez al padre
        useEffect(() => {
            onValidityChange?.(check);
        }, [check]);

        // Resetear ciertos flags si es alquiler
        useEffect(() => {
            if (form.operation === 'ALQUILER' && (form.credit || form.financing)) {
                setField('credit', false);
                setField('financing', false);
            }
        }, [form.operation]);

        // Helpers
        const num = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (val === '') return setField(k, '' as any);
            const n = parseInt(val, 10);
            if (!isNaN(n)) setField(k, n as any);
        };

        const handleMain = (f: File | null) => handleMainImage(f, form, setField, onImageSelect);
        const handleGallery = (fs: File[]) => handleGalleryImages(fs, form, setField, onImageSelect);

        useEffect(() => {
            // solo reseteo si ya tengo un valor “viejo” que limpiar
            if (!showRooms && form.rooms !== 0) setField('rooms', 0 as any);
            if (!showBedrooms && form.bedrooms !== 0) setField('bedrooms', 0 as any);
            if (!showBathrooms && form.bathrooms !== 0) setField('bathrooms', 0 as any);
            if (!showCoveredArea && form.coveredArea !== 0) setField('coveredArea', 0 as any);
        }, [
            showRooms,
            showBedrooms,
            showBathrooms,
            showCoveredArea,
            form.rooms,
            form.bedrooms,
            form.bathrooms,
            form.coveredArea,
            setField,
        ]);

        return (
            <Box component="form" noValidate onSubmit={e => { e.preventDefault(); submit(); }}>
                <Grid container spacing={1.5}>
                    {/* Título */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Título"
                            value={form.title}
                            onChange={e => setField('title', e.target.value)}
                            required
                            error={!!fieldErrors.title}
                            size="small"
                        />
                    </Grid>

                    {/* Operación y Estado */}
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth select
                            label="Operación"
                            value={form.operation}
                            onChange={e => setField('operation', e.target.value)}
                            required error={!!fieldErrors.operation}
                            size="small"
                        >
                            <MenuItem value="VENTA">Venta</MenuItem>
                            <MenuItem value="ALQUILER">Alquiler</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth select
                            label="Estado"
                            value={form.status}
                            onChange={e => setField('status', e.target.value)}
                            required error={!!fieldErrors.status}
                            size="small"
                        >
                            <MenuItem value="DISPONIBLE">Disponible</MenuItem>
                            <MenuItem value="VENDIDA">Vendida</MenuItem>
                            <MenuItem value="ALQUILADA">Alquilada</MenuItem>
                            <MenuItem value="RESERVADA">Reservada</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Opciones de crédito sólo en venta */}
                    {form.operation === 'VENTA' && (
                        <>
                            <Grid size={{ xs: 6 }}>
                                <Stack direction="row" alignItems="center" px={1} py={0.5} sx={{
                                    border: '1px solid #ccc',
                                    borderRadius: 1,
                                    '&:hover': { borderColor: '#444' },
                                }}>
                                    <Checkbox
                                        checked={form.credit}
                                        onChange={e => setField('credit', e.target.checked)}
                                        size="small"
                                        sx={{ p: 0.7 }}

                                    />
                                    <Typography variant="body1">Apto Crédito</Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Stack direction="row" alignItems="center" px={1} py={0.5} sx={{
                                    border: '1px solid #ccc',
                                    borderRadius: 1,
                                    '&:hover': { borderColor: '#444' },
                                }}>
                                    <Checkbox
                                        checked={form.financing}
                                        onChange={e => setField('financing', e.target.checked)}
                                        size="small"
                                        sx={{ p: 0.7 }}

                                    />
                                    <Typography variant="body1">Apto Financiamiento</Typography>
                                </Stack>
                            </Grid>
                        </>
                    )}

                    {/* Moneda, precio, expensas */}
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth select
                            label="Moneda"
                            value={form.currency}
                            onChange={e => setField('currency', e.target.value)}
                            required error={!!fieldErrors.currency}
                            size="small"
                        >
                            <MenuItem value="ARS">Peso Argentino</MenuItem>
                            <MenuItem value="USD">Dólar</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth
                            label="Precio"
                            value={form.price === 0 ? '' : form.price}
                            onChange={num('price')}
                            required error={!!fieldErrors.price}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth disabled
                            label="Moneda Expensas"
                            value="Peso Argentino"
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth
                            label="Expensas"
                            value={form.expenses ?? ''}          // ← muestra “0” si vale 0
                            onChange={num('expenses')}
                            required
                            error={!!fieldErrors.expenses}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            size="small"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setField('expenses', 0 as any)}
                                            title="Sin expensas"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {/* Mostrar precio */}
                    <Grid size={{ xs: 12 }}>

                        <Stack direction="row" alignItems="center" px={1} py={0.5} sx={{
                            border: '1px solid #ccc',
                            borderRadius: 1,
                            '&:hover': { borderColor: '#444' },
                        }}>
                            <Checkbox
                                checked={form.showPrice}
                                onChange={e => setField('showPrice', e.target.checked)}
                                size="small"
                                sx={{ p: 0.7 }}

                            />
                            <Typography variant="body1">Mostrar precio de {form.operation === 'VENTA' ? 'venta' : 'alquiler'} y expensas</Typography>
                        </Stack>
                    </Grid>

                    {/* Descripción */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth multiline rows={3}
                            label="Descripción"
                            value={form.description}
                            onChange={e => setField('description', e.target.value)}
                            required error={!!fieldErrors.description}
                            size="small"
                        />
                    </Grid>

                    {/* Dirección */}
                    <Grid size={{ xs: 8 }}>
                        <TextField
                            fullWidth label="Calle"
                            value={form.street}
                            onChange={e => setField('street', e.target.value)}
                            required error={!!fieldErrors.street}
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                        <TextField
                            fullWidth label="Número"
                            value={form.number}
                            onChange={e => setField('number', e.target.value)}
                            required error={!!fieldErrors.number}
                            size="small"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setField('number', 'S/N')}
                                            title="Sin número"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {/* Ambientes dinámicos */}
                    {showRooms && (
                        <Grid size={{ xs: colSize }}>
                            <TextField
                                fullWidth label="Ambientes"
                                value={form.rooms === 0 ? '' : form.rooms}
                                onChange={num('rooms')}
                                required error={!!fieldErrors.rooms}
                                size="small"
                            />
                        </Grid>
                    )}
                    {showBedrooms && (
                        <Grid size={{ xs: colSize }}>
                            <TextField
                                fullWidth label="Dormitorios"
                                value={form.bedrooms === 0 ? '' : form.bedrooms}
                                onChange={num('bedrooms')}
                                required error={!!fieldErrors.bedrooms}
                                size="small"
                            />
                        </Grid>
                    )}
                    {showBathrooms && (
                        <Grid size={{ xs: colSize }}>
                            <TextField
                                fullWidth label="Baños"
                                value={form.bathrooms === 0 ? '' : form.bathrooms}
                                onChange={num('bathrooms')}
                                required error={!!fieldErrors.bathrooms}
                                helperText={fieldErrors.bathrooms}
                                size="small"
                            />
                        </Grid>
                    )}
                    <Grid size={{ xs: showCoveredArea ? 6 : 12 }}>
                        <TextField
                            fullWidth label="Superficie Total"
                            value={form.area === 0 ? '' : form.area}
                            onChange={num('area')}
                            required error={!!fieldErrors.area}
                            size="small"
                        />
                    </Grid>
                    {showCoveredArea && (
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                fullWidth label="Superficie Cubierta"
                                value={form.coveredArea === 0 ? '' : form.coveredArea}
                                onChange={num('coveredArea')}
                                required error={!!fieldErrors.coveredArea}
                                helperText={fieldErrors.coveredArea}
                                size="small"
                            />
                        </Grid>
                    )}

                    {/* Uploader de imágenes */}
                    <Grid size={{ xs: 6 }}>
                        <ImageUploader
                            label="Cargar Imagen principal"
                            onSelect={files => handleMain(files[0] ?? null)}
                        />
                        {fieldErrors.mainImage && (
                            <Typography variant="caption" color="error">
                                {fieldErrors.mainImage}
                            </Typography>
                        )}
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <ImageUploader
                            label="Cargar Imágenes adicionales"
                            multiple append
                            onSelect={files => handleGallery(Array.from(files))}
                        />
                    </Grid>
                </Grid>
            </Box >
        );
    }
);   