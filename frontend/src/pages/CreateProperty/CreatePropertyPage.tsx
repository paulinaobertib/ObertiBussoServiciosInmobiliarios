import { useState, useRef } from 'react';
import { Container, Grid, Box, Typography, Button, useMediaQuery } from '@mui/material';
import { usePropertyCrud } from '../../app/property/context/PropertyCrudContext';

import CategoryButton from '../../app/property/components/CategoryButton';
import CategoryItems from '../../app/property/components/CategoryItems';
import PropertyForm, { PropertyFormHandle } from '../../app/property/components/forms/PropertyForm';
import PropertyPreview from '../../app/property/components/PropertyPreview';
import { useConfirmDialog } from '../../app/property/utils/ConfirmDialog';
import { useGlobalAlert } from '../../app/property/context/AlertContext';

export default function CreatePropertyPage() {
    /* ---------- estado ---------- */
    const [gallery, setGallery] = useState<File[]>([]);
    const [main, setMain] = useState<File | null>(null);
    const { showAlert } = useGlobalAlert();

    const { selected, allTypes, resetSelected } = usePropertyCrud();

    const formRef = useRef<PropertyFormHandle>(null);

    const lowScreen = useMediaQuery('(max-height:800px)', { noSsr: true });


    /* ---------- callbacks imágenes ---------- */
    const handleImages = (m: File | null, g: File[]) => { setMain(m); setGallery(g); };

    const deleteImg = (file: File) => {
        if (file === main) {
            const [first, ...rest] = gallery;
            setMain(first ?? null); setGallery(rest);
        } else setGallery(gallery.filter(f => f !== file));

        formRef.current?.deleteImage(file);
    };

    /* ---------- botonería confirm ----------- */
    const { ask, DialogUI } = useConfirmDialog();
    const save = () => ask('¿Guardar la propiedad?', async () => {
        const ok = await formRef.current?.submit();
        if (ok) {
            showAlert('¡Propiedad creada correctamente!', 'success');
            resetSelected();
            setMain(null);
            setGallery([]);
        } else {
            showAlert('Error al guardar la propiedad', 'error');
        }
    });

    const cancel = () => ask('¿Vaciar el formulario?', () => {
        formRef.current?.reset();
        setMain(null);
        setGallery([]);
        resetSelected();
        showAlert('Formulario vaciado correctamente', 'info');
    });

    /* ---------- textos ---------- */
    const selectedTypeName = allTypes.find(t => t.id === selected.type)?.name ?? '';
    const title = selectedTypeName
        ? `Formulario de ${selectedTypeName}`
        : 'Formulario de Creación';

    return (
        <Container maxWidth={false} sx={{ display: 'flex', height: { xs: 'auto', md: '95vh' }, overflow: 'hidden', p: 2, flexDirection: { xs: 'column', md: 'row' }, }}  >
            <Grid container spacing={3} sx={{ height: '100%' }}>

                {/* -------- PANEL IZQUIERDO -------- */}
                <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', }}>

                    <Box sx={{ p: 2, mb: 2, borderRadius: 4, boxShadow: 5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF6C00', mb: 3, textAlign: 'center' }}>
                            Gestión de Categorías
                        </Typography>

                        <Grid container spacing={2} justifyContent="center">
                            <Grid><CategoryButton category="neighborhood" label="Barrios" /></Grid>
                            <Grid><CategoryButton category="owner" label="Propietarios" /></Grid>
                            <Grid><CategoryButton category="amenity" label="Servicios" /></Grid>
                            <Grid><CategoryButton category="type" label="Tipos" /></Grid>
                        </Grid>
                    </Box>

                    <Box sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        p: 2,
                        borderRadius: 4,
                        boxShadow: 5,
                    }}>
                        <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'hidden' }}>
                            <CategoryItems />
                        </Box>

                        <Box sx={{ pt: 2, textAlign: 'center' }}>
                            <Button variant="contained" onClick={save} sx={{ mr: 2 }}>Guardar</Button>
                            <Button variant="contained" onClick={cancel}>Cancelar</Button>
                        </Box>
                    </Box>
                </Grid>

                {/* -------- PANEL DERECHO -------- */}
                <Grid size={{ xs: 12, md: 8 }} sx={{
                    display: 'flex', flexDirection: lowScreen ? 'row' : 'column', width: '100%', height: '100%', gap: 2
                }}>

                    {/* formulario */}
                    <Box sx={{
                        display: 'flex', flexDirection: 'column', p: 2, borderRadius: 4, boxShadow: 5,
                        flex: lowScreen ? '0 0 60%' : 'none', overflow: 'hidden', minHeight: 0
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF6C00', mb: 2, textAlign: 'center' }}>
                            {title}
                        </Typography>
                        <PropertyForm ref={formRef} onImageSelect={handleImages} />
                    </Box>

                    {/* Vista previa fuera del form, opcional */}
                    <Box
                        sx={{

                            p: 2,
                            borderRadius: 4,
                            boxShadow: 5,
                            flexGrow: lowScreen ? 0 : 1,
                            overflow: 'hidden',
                            minHeight: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <Box>
                            <Typography variant="h6"
                                sx={{ fontWeight: 700, color: '#EF6C00', mb: 1, textAlign: 'center' }}>
                                Previsualización de Imagenes
                            </Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1, minHeight: 0, maxHeight: '100%' }}>
                            <PropertyPreview
                                main={main}
                                images={gallery}
                                vertical={lowScreen}
                                onDelete={deleteImg}
                            />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            {DialogUI}
        </Container >
    );
}
