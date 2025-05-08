/* ------------------------------------------------------------------ */
/*  EditPropertyPage.tsx                                              */
/* ------------------------------------------------------------------ */
import { useEffect, useState } from 'react';
import {
    Container, Box, Typography, CircularProgress, Button,
    Stepper, Step, StepLabel, Stack
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useParams } from 'react-router-dom';

/* hooks y contextos */
import { useCreateProperty } from '../../app/property/hooks/useCreateProperty';
import { usePropertyCrud } from '../../app/property/context/PropertyCrudContext';
import { useConfirmDialog } from '../../app/property/utils/ConfirmDialog';
import { useGlobalAlert } from '../../app/property/context/AlertContext';

/* componentes */
import PropertyForm from '../../app/property/components/forms/PropertyForm';
import PropertyPreview from '../../app/property/components/PropertyPreview';
import CategoryButton from '../../app/property/components/CategoryButton';
import CategoryItems from '../../app/property/components/CategoryItems';

/* servicios */
import { getPropertyById, putProperty } from '../../app/property/services/property.service';
import { getOwnerByPropertyId } from '../../app/property/services/owner.service';
import { getImagesByPropertyId, postImage, deleteImageById, ImageDTO, } from '../../app/property/services/image.service';

/* tipos */
import { Image } from '../../app/property/types/image';
import { PropertyUpdate } from '../../app/property/types/property';

export default function EditPropertyPage() {
    const { id } = useParams<{ id: string }>();
    const propId = Number(id);

    /* hook creación + fotos locales */
    const {
        formRef, main, gallery, setMain, setGallery,
        deleteImgFile, loading, setLoading, handleImages
    } = useCreateProperty();

    /* CRUD context */
    const { selected, setSelected, resetSelected, allTypes } = usePropertyCrud();
    const { showAlert } = useGlobalAlert();
    const { ask, DialogUI } = useConfirmDialog();

    /* estado local */
    const [property, setProperty] = useState<any | null>(null);
    const [imagesBackend, setImagesBackend] = useState<ImageDTO[]>([]);
    const [activeStep, setActiveStep] = useState(0);
    const [formReady, setFormReady] = useState(false);

    /* ------------------------------------------------------------------
     * 1.  Cargar datos (propiedad + owner + fotos)
     * ---------------------------------------------------------------- */
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);

                /* fetch paralelos */
                const [prop, owner, imgList] = await Promise.all([
                    getPropertyById(propId),
                    getOwnerByPropertyId(propId),
                    getImagesByPropertyId(propId),
                ]);

                if (!mounted) return;
                /* dividir principal/galería */
                const mainPic = imgList[0];
                const gallery = imgList.filter(i => i !== mainPic);


                /* setSelected (categorías) */
                setSelected({
                    owner: owner.id,
                    neighborhood: prop.neighborhood?.id ?? null,
                    type: prop.type?.id ?? null,
                    amenities: prop.amenities?.map((a: any) => a.id) ?? [],
                });


                setProperty({
                    ...prop,
                    ownerId: owner.id,
                    mainImage: mainPic?.url ?? prop.mainImage,
                    images: gallery.map(g => g.url),
                });

                handleImages(
                    mainPic?.url ?? prop.mainImage,
                    gallery.map(g => g.url)
                );

                setImagesBackend(imgList);

            } catch {
                showAlert('Error al cargar la propiedad', 'error');
            } finally {
                setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [propId]);

    /* ------------------------------------------------------------------
     * 2.  Borrar imagen (URL ó File)
     * ---------------------------------------------------------------- */
    const handleDeleteImg = async (pic: Image) => {
        if (typeof pic === 'string') {
            const dto = imagesBackend.find(i => i.url === pic);
            if (dto) {
                await deleteImageById(dto.id);
                setImagesBackend(arr => arr.filter(i => i.id !== dto.id));
            }
            // Si borramos la imagen principal, reasignar otra o null
            if (pic === (main ?? property?.mainImage)) {
                const [next, ...rest] = gallery.filter(u => u !== pic);
                setMain(next ?? null);
                setGallery(rest);
                return;
            }
            setGallery(arr => arr.filter(u => u !== pic));
            return;
        }
        deleteImgFile(pic);
    };
    /* ------------------------------------------------------------------
     * 3.  Guardar cambios
     * ---------------------------------------------------------------- */
    const save = () =>
        ask('¿Guardar los cambios?', async () => {
            const valid = await formRef.current?.submit();
            if (!valid) { showAlert('Formulario inválido', 'error'); return; }

            try {
                setLoading(true);

                /* ------------ GUARDAR (dentro de save) ------------- */
                /* B) galería */
                const newGallery = await Promise.all(
                    gallery.map(p =>
                        p instanceof File
                            ? postImage(p, propId)
                            : Promise.resolve(p)
                    )
                );
                setGallery(newGallery);

                /* D) PUT propiedad */
                const payload: PropertyUpdate = {
                    id: propId,
                    ...formRef.current!.getUpdateData(),
                    mainImage: main instanceof File ? main : main as string,
                };
                await putProperty({ ...payload, id: propId });
                showAlert('¡Propiedad actualizada!', 'success');

            } catch (err) {
                console.error(err);
                showAlert('Error al actualizar la propiedad', 'error');
            } finally {
                setLoading(false);
            }
        });

    /* cancelar */
    const cancel = () =>
        ask('¿Cancelar los cambios?', () => {
            formRef.current?.reset();
            resetSelected();
            setMain(null);
            setGallery([]);
            showAlert('Cambios descartados.', 'info');
        });

    /* texto encabezado */
    const selectedTypeName = allTypes.find(t => t.id === selected.type)?.name ?? '';
    const title = selectedTypeName ? `Edición de ${selectedTypeName}` : 'Edición de Propiedad';

    /* pasos */
    const categories = ['type', 'neighborhood', 'owner', 'amenity'] as const;
    const canProceed = categories.every(k =>
        k === 'amenity' ? selected.amenities.length > 0 : Boolean(selected[k])
    );

    /* ------------------------------------------------------------------
     * 4.  UI
     * ---------------------------------------------------------------- */
    return (
        <Container maxWidth={false} sx={{ pt: 2, height: '97vh', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* barra superior */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Button variant="outlined" onClick={cancel} sx={{ mr: 2 }}>CANCELAR</Button>

                <Box sx={{ flexGrow: 1 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        <Step><StepLabel>Categorías</StepLabel></Step>
                        <Step><StepLabel>Formulario</StepLabel></Step>
                    </Stepper>
                </Box>

                <Button variant="contained" onClick={save} disabled={!formReady}>GUARDAR</Button>
            </Box>

            {/* loader overlay */}
            {loading && (
                <Box sx={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    bgcolor: 'rgba(255,255,255,0.7)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <CircularProgress size={48} />
                </Box>
            )}

            {/* Paso 0: categorías */}
            {activeStep === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#EF6C00', mb: 2, textAlign: 'center' }}>
                        Gestión de Categorías
                    </Typography>

                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
                        {categories.map((cat, i) => (
                            <Box key={cat} sx={{ display: 'flex', alignItems: 'center' }}>
                                <CategoryButton category={cat} />
                                {i < categories.length - 1 && <NavigateNextIcon sx={{ mx: 0.5, color: '#BDBDBD' }} />}
                            </Box>
                        ))}
                    </Stack>

                    <Box sx={{
                        flexGrow: 1, width: '100%', maxWidth: '96vw', mx: 'auto',
                        boxShadow: 2, borderRadius: 2, overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', bgcolor: 'background.paper',
                    }}>
                        <CategoryItems />
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={() => setActiveStep(1)} disabled={!canProceed}>
                            Siguiente
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Paso 1: formulario + preview */}
            {activeStep === 1 && (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        alignItems: 'stretch',
                        flexGrow: 1,
                        minHeight: 0,
                    }}>
                        {/* formulario */}
                        <Box sx={{ flex: 2, p: 2, borderRadius: 4, boxShadow: 5, bgcolor: 'background.paper', minHeight: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF6C00', mb: 2, textAlign: 'center' }}>
                                {title}
                            </Typography>

                            {property ? (
                                <PropertyForm
                                    ref={formRef}
                                    initialData={property}
                                    onImageSelect={handleImages}
                                    onValidityChange={setFormReady}
                                />
                            ) : (
                                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography>Cargando propiedad…</Typography>
                                </Box>
                            )}
                        </Box>

                        {/* preview */}
                        <Box sx={{
                            flex: 1, p: 2, borderRadius: 4, boxShadow: 5, bgcolor: 'background.paper',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF6C00', mb: 2, textAlign: 'center' }}>
                                Previsualización de Imágenes
                            </Typography>

                            <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                                <PropertyPreview
                                    main={main ?? property?.mainImage}
                                    images={gallery}
                                    onDelete={handleDeleteImg}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={() => setActiveStep(0)}>Volver</Button>
                    </Box>
                </Box>
            )}

            {DialogUI}
        </Container>
    );
}
