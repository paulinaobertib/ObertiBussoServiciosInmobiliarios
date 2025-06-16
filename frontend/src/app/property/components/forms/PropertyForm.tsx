import {
    Box, Grid, TextField, MenuItem, InputAdornment,
    IconButton, Typography,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import EditOffIcon from '@mui/icons-material/EditOff';
import ImageUploader from '../ImageUploader';
import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';

import { usePropertyForm } from '../../hooks/usePropertyForm';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { useImageHandlers as useImageHandlers } from '../../hooks/useImageHandlersCreate';

import { Property, PropertyCreate, PropertyUpdate } from '../../types/property';

interface Props {
    onImageSelect?: (main: string | File | null, gallery: (string | File)[]) => void;
    onValidityChange?: (valid: boolean) => void;
    initialData?: Property;
}

export type PropertyFormHandle = {
    submit: () => Promise<boolean>;
    reset: () => void;
    deleteImage: (f: File) => void;
    setField: <K extends keyof Property>(key: K, value: Property[K]) => void;
    getCreateData: () => PropertyCreate;
    getUpdateData: () => PropertyUpdate;
};

const PropertyForm = forwardRef<PropertyFormHandle, Props>(function PropertyForm(
    { onImageSelect, onValidityChange, initialData },
    ref
) {
    const {
        form,
        setField,
        submit,
        reset,
        fieldErrors,
        check,
        getCreateData,
        getUpdateData,
    } = usePropertyForm();

    const {
        selected,
        ownersList,
        neighborhoodsList,
        typesList,
        amenitiesList,
    } = usePropertyCrud();

    const { handleMainImage, handleGalleryImages, deleteImage } = useImageHandlers();

    useEffect(() => {
        if (initialData) {
            Object.entries(initialData).forEach(([k, v]) => {
                if (k in form) setField(k as keyof typeof form, v as any);
            });
        }
    }, [initialData]);

    useEffect(() => {
        const o = ownersList.find(o => o.id === selected.owner);
        if (o && form.owner.id !== o.id) {
            setField('owner', o);
        }
    }, [selected.owner, ownersList, setField]);

    useEffect(() => {
        const n = neighborhoodsList.find(n => n.id === selected.neighborhood);
        if (n && form.neighborhood.id !== n.id) {
            setField('neighborhood', n);
        }
    }, [selected.neighborhood, neighborhoodsList, setField, form.neighborhood.id]);

    useEffect(() => {
        const t = typesList.find(t => t.id === selected.type);
        if (t && form.type.id !== t.id) {
            setField('type', t);
        }
    }, [selected.type, typesList, setField, form.type.id]);

    useEffect(() => {
        const a = amenitiesList.filter(a => selected.amenities.includes(a.id));
        if (JSON.stringify(a.map(x => x.id)) !== JSON.stringify(form.amenities.map(x => x.id))) {
            setField('amenities', a);
        }
    }, [selected.amenities, amenitiesList, setField, form.amenities]);

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

    useEffect(() => {
        onValidityChange?.(check);
    }, [check, onValidityChange]);

    useEffect(() => {
        if (form.operation === 'ALQUILER') {
            if (form.credit || form.financing) {
                setField('credit', false);
                setField('financing', false);
            }
        }
    }, [form.operation]);

    useImperativeHandle(ref, () => ({
        submit,
        reset,
        deleteImage: f => deleteImage(f, form, setField, onImageSelect),
        setField: setField as any,
        getCreateData,
        getUpdateData,
    }));

    const num = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') return setField(k, '' as any);
        const n = parseInt(val, 10);
        if (!isNaN(n)) setField(k, n as any);
    };

    const handleMain = (f: File | null) =>
        handleMainImage(f, form, setField, onImageSelect);
    const handleGallery = (fs: File[]) =>
        handleGalleryImages(fs, form, setField, onImageSelect);

    return (
        <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}
        >
            <Grid container spacing={1.5} sx={{ flexGrow: 1 }}>
                <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Título" value={form.title}
                        onChange={(e) => setField('title', e.target.value)} required
                        error={!!fieldErrors.title}
                        size='small'
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <TextField fullWidth select label="Moneda" value={form.currency}
                        onChange={(e) => setField('currency', e.target.value)} required
                        error={!!fieldErrors.currency}
                        size='small'
                    >
                        <MenuItem value="ARS">Peso Argentino</MenuItem>
                        <MenuItem value="USD">Dólar</MenuItem>
                    </TextField>
                </Grid>

                <Grid size={{ xs: 6, md: 6 }}>
                    <TextField fullWidth label="Precio" value={form.price === 0 ? "" : form.price}
                        onChange={num('price')} required
                        error={!!fieldErrors.price}
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        size='small'
                    />
                </Grid>

                <Grid size={{ xs: 6, md: 3 }}>
                    <FormControlLabel
                        sx={{
                            width: 'auto', m: 0, py: 0,
                            display: 'flex',
                            alignItems: 'left',
                            px: 1,
                            border: '1px solid #ccc',
                            borderRadius: 1,
                            '&:hover': { borderColor: '#444' },
                            '& .MuiFormControlLabel-label': {
                                fontSize: '0.9rem',
                                color: 'text.secondary',
                            },
                        }}
                        control={
                            <Checkbox
                                checked={form.showPrice}
                                onChange={(e) => setField('showPrice', e.target.checked)}
                                size="small"
                            />
                        }
                        label="Mostrar precio"

                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <TextField fullWidth multiline rows={3} label="Descripción" value={form.description}
                        onChange={(e) => setField('description', e.target.value)} required
                        error={!!fieldErrors.description}
                        size='small'
                    />
                </Grid>

                <Grid size={{ xs: 6, md: 8 }}>
                    <TextField fullWidth label="Calle" value={form.street}
                        onChange={(e) => setField('street', e.target.value)} required
                        error={!!fieldErrors.street}
                        size='small'
                    />
                </Grid>

                <Grid size={{ xs: 6, md: 4 }}>
                    <TextField
                        fullWidth
                        label="Número"
                        value={form.number}
                        size='small'
                        onChange={(e) => setField('number', e.target.value)} required
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

                {showRooms && (
                    <Grid size={{ xs: colSize }}>
                        <TextField fullWidth label="Ambientes"
                            size='small'
                            value={form.rooms === 0 ? "" : form.rooms}
                            error={!!fieldErrors.rooms}
                            onChange={num('rooms')} required
                        />
                    </Grid>
                )}

                {showBedrooms && (
                    <Grid size={{ xs: colSize }}>
                        <TextField fullWidth label="Dormitorios"
                            size='small'
                            value={form.bedrooms === 0 ? "" : form.bedrooms}
                            error={!!fieldErrors.bedrooms}
                            onChange={num('bedrooms')} required
                        />
                    </Grid>
                )}

                {showBathrooms && (
                    <Grid size={{ xs: colSize }}>
                        <TextField fullWidth label="Baños"
                            size='small'
                            value={form.bathrooms === 0 ? "" : form.bathrooms}
                            error={!!fieldErrors.bathrooms}
                            helperText={fieldErrors.bathrooms}

                            onChange={num('bathrooms')} required
                        />
                    </Grid>
                )}

                <Grid size={{ xs: showCoveredArea ? 6 : 12 }}>
                    <TextField fullWidth label="Superficie m²" value={form.area === 0 ? "" : form.area}
                        error={!!fieldErrors.area}
                        size='small'
                        onChange={num('area')} required />
                </Grid>


                {showCoveredArea && (
                    <Grid size={{ xs: 6 }}>
                        <TextField fullWidth label="Superficie Cubierta"
                            size='small'
                            value={form.coveredArea === 0 ? "" : form.coveredArea}
                            error={!!fieldErrors.coveredArea}
                            helperText={fieldErrors.coveredArea}

                            onChange={num('coveredArea')} required
                        />
                    </Grid>
                )}

                <Grid size={{ xs: 6 }}>
                    <TextField fullWidth select label="Estado" value={form.status}
                        error={!!fieldErrors.status}
                        size='small'
                        onChange={(e) => setField('status', e.target.value)} required
                    >
                        <MenuItem value="DISPONIBLE">Disponible</MenuItem>
                        <MenuItem value="VENDIDA">Vendida</MenuItem>
                        <MenuItem value="ALQUILADA">Alquilada</MenuItem>
                        <MenuItem value="RESERVADA">Reservada</MenuItem>
                    </TextField>
                </Grid>

                <Grid size={{ xs: 6 }}>
                    <TextField
                        fullWidth select label="Operación" value={form.operation}
                        error={!!fieldErrors.operation}
                        size='small'
                        onChange={(e) => setField('operation', e.target.value)} required
                    >
                        <MenuItem value="VENTA">Venta</MenuItem>
                        <MenuItem value="ALQUILER">Alquiler</MenuItem>
                    </TextField>
                </Grid>

                {form.operation === 'VENTA' && (
                    <>
                        <Grid size={{ xs: 6 }}>
                            <FormControlLabel
                                sx={{
                                    width: 'auto', m: 0, py: 0,
                                    display: 'flex',
                                    alignItems: 'left',
                                    px: 1,
                                    border: '1px solid #ccc',
                                    borderRadius: 1,
                                    '&:hover': { borderColor: '#444' },
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: '0.85rem',
                                        color: 'text.secondary',
                                    },
                                }}
                                control={
                                    <Checkbox
                                        checked={form.credit}
                                        onChange={(e) => setField('credit', e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Apto Crédito"
                            />
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                            <FormControlLabel
                                sx={{
                                    width: 'auto', m: 0, py: 0,
                                    display: 'flex',
                                    alignItems: 'left',
                                    px: 1,
                                    border: '1px solid #ccc',
                                    borderRadius: 1,
                                    '&:hover': { borderColor: '#444' },
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: '0.85rem',
                                        color: 'text.secondary',
                                    },
                                }}
                                control={
                                    <Checkbox
                                        checked={form.financing}
                                        onChange={(e) => setField('financing', e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Apto Financiamiento"
                            />
                        </Grid>
                    </>
                )}

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