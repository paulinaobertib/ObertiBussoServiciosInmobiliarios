import { useEffect, useState } from 'react';
import {
  Box, Button,
  Step, StepLabel, Stepper, Typography,
  useTheme
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

// hooks y contextos
import { useCreateProperty } from '../app/property/hooks/useCreateProperty';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';
import { useConfirmDialog } from '../app/property/utils/ConfirmDialog';
import { useGlobalAlert } from '../app/shared/context/AlertContext';

// componentes
import PropertyForm from '../app/property/components/forms/PropertyForm';
import PropertyPreview from '../app/property/components/PropertyPreview';
import CategoryPanel from '../app/property/components/CategoryPanel';
import PanelManager, { PanelConfig } from '../app/shared/components/PanelManager';

// servicios
import {
  getPropertyById, putProperty
} from '../app/property/services/property.service';
import {
  getOwnerByPropertyId
} from '../app/property/services/owner.service';
import {
  getImagesByPropertyId, postImage, deleteImageById, ImageDTO,
} from '../app/property/services/image.service';

// tipos y rutas
import { Image } from '../app/property/types/image';
import { ROUTES } from '../lib';
import { BasePage } from './BasePage';

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const propId = Number(id);
  const navigate = useNavigate();

  // hook para manejar imágenes y formulario
  const { formRef, main, gallery, setMain, setGallery, deleteImgFile, setLoading, handleImages } = useCreateProperty();

  // contexto CRUD
  const { selected, setSelected, resetSelected, typesList, pickItem } = usePropertyCrud();
  const { showAlert } = useGlobalAlert();
  const { ask, DialogUI } = useConfirmDialog();
  const theme = useTheme()

  // estado local
  const [property, setProperty] = useState<any | null>(null);
  const [imagesBackend, setImagesBackend] = useState<ImageDTO[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [formReady, setFormReady] = useState(false);

  type CategoryKey = 'type' | 'neighborhood' | 'owner' | 'amenity';

  const categoryKeys: CategoryKey[] = [
    'type',
    'neighborhood',
    'owner',
    'amenity',
  ];

  /* categorías necesarias para continuar -------------------------- */
  const categoryPanels: PanelConfig[] = [
    {
      key: 'type',
      label: 'Tipos',
      content: <CategoryPanel category="type" />,
    },
    {
      key: 'neighborhood',
      label: 'Barrios',
      content: <CategoryPanel category="neighborhood" />,
    },
    {
      key: 'owner',
      label: 'Propietarios',
      content: <CategoryPanel category="owner" />,
    },
    {
      key: 'amenity',
      label: 'Caracteristicas',
      content: <CategoryPanel category="amenity" />,
    },
  ];

  // 1) Cargar datos al montar
  useEffect(() => {
    pickItem('category', null);
    resetSelected();

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [prop, owner, imgList] = await Promise.all([
          getPropertyById(propId),
          getOwnerByPropertyId(propId),
          getImagesByPropertyId(propId),
        ]);
        if (!mounted) return;

        const mainUrl = prop.mainImage;
        const galleryDTO = imgList.filter(i => i.url !== mainUrl);

        // categorías
        setSelected({
          owner: owner.id,
          neighborhood: prop.neighborhood?.id ?? null,
          type: prop.type?.id ?? null,
          amenities: prop.amenities?.map((a: any) => a.id) ?? [],
        });

        // hidratar tanto el estado local como el form
        setProperty({
          ...prop,
          ownerId: owner.id,
          mainImage: mainUrl,                     // 🔸 ahora incluido
          images: galleryDTO.map(g => g.url),
        });
        formRef.current?.setField('mainImage', mainUrl);           // 🔸 hidrata el form
        formRef.current?.setField('images', galleryDTO.map(g => g.url));

        // preview
        handleImages(mainUrl, galleryDTO.map(g => g.url));
        setImagesBackend(imgList);
      } catch (error: any) {
        const message = error.response?.data ?? 'Error desconocido';
        showAlert(message, 'error');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [propId]);

  // 2) Borrar imagen (URL o File)
  const handleDeleteImg = async (pic: Image) => {
    if (typeof pic === 'string') {
      const dto = imagesBackend.find(i => i.url === pic);
      if (dto) {
        await deleteImageById(dto.id);
        setImagesBackend(arr => arr.filter(i => i.id !== dto.id));
      }
      const newGallery = gallery.filter(u => u !== pic);

      if (pic === main) {
        // si borran la principal explícitamente
        setMain(null);
        formRef.current?.setField('mainImage', null);
        setProperty((p: any) => p ? { ...p, mainImage: null } : p);
      }

      setGallery(newGallery);
      formRef.current?.setField('images', newGallery);
      return;
    }
    // archivo local
    deleteImgFile(pic);
  };

  // 3) Guardar cambios
  const save = () =>
    ask('¿Guardar los cambios?', async () => {
      const valid = await formRef.current?.submit();
      if (!valid) { showAlert('Formulario inválido, faltan datos', 'error'); return; }
      if (!main) { showAlert('Necesitas una imagen principal', 'error'); return; }

      try {
        setLoading(true);

        // subir nuevos archivos de galería
        const newGallery = await Promise.all(
          gallery.map(p => p instanceof File ? postImage(p, propId) : Promise.resolve(p))
        );
        setGallery(newGallery);
        formRef.current?.setField('images', newGallery);

        // preparar payload
        const payload: any = {
          id: propId,
          ...formRef.current!.getUpdateData(),
        };
        if (main instanceof File) payload.mainImage = main;

        // PUT multipart
        const updated = await putProperty(payload);

        setMain(updated.mainImage);
        formRef.current?.setField('mainImage', updated.mainImage);

        resetSelected();
        navigate(ROUTES.HOME_APP, { replace: true });
        showAlert('Propiedad actualizada con éxito', 'success');
      } catch (error: any) {
        const message = error.response?.data ?? 'Error desconocido';
        showAlert(message, 'error');
      } finally {
        setLoading(false);
      }
    });

  // cancelar edición
  const cancel = () =>
    ask('¿Cancelar los cambios?', async () => {
      formRef.current?.reset();
      resetSelected();
      setMain(null);
      setGallery([]);
      showAlert('Cambios descartados.', 'info');
      navigate(ROUTES.HOME_APP, { replace: true });
    });

  // etiquetas y lógica UI
  const selectedTypeName = typesList.find(t => t.id === selected.type)?.name ?? '';
  const title = selectedTypeName
    ? `Edición de ${selectedTypeName}`
    : 'Edición de Propiedad';


  const canProceed = categoryKeys.every(k =>
    k === 'amenity' ? selected.amenities.length > 0 : Boolean(selected[k])
  );

  return (
    <BasePage maxWidth={true}>
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: { xs: 'auto', md: 'hidden' },
      }}>
        {/* ------- barra superior (stepper + botones) ------- */}
        <Box sx={{ justifyContent: 'center', display: 'flex', alignItems: 'center', mb: 1, flexShrink: 0 }}>

          <Button variant="contained" onClick={() => setActiveStep(0)} sx={{ mr: 2, display: { xs: "flex", md: "none" } }}>
            Volver
          </Button>

          <Button variant="outlined" onClick={cancel} sx={{ mr: 2 }}>
            CANCELAR
          </Button>

          <Box sx={{
            display: { xs: 'none', md: 'block' }, flexGrow: 1
          }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              <Step><StepLabel>Categorías</StepLabel></Step>
              <Step><StepLabel>Formulario</StepLabel></Step>
            </Stepper>
          </Box>

          <Button variant="contained" onClick={save} disabled={!formReady}>
            GUARDAR
          </Button>
        </Box>

        {/* ------- STEP 0 : categorías ------- */}
        {activeStep === 0 && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* título */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 2, textAlign: 'center' }}>
              Gestión de Categorías
            </Typography>

            {/* botones categoría */}
            {/* botones categoría */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, alignItems: 'center' }}>
              <PanelManager panels={categoryPanels} direction="row" />
            </Box>

            {/* botón siguiente */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <Button variant="contained" onClick={() => setActiveStep(1)} disabled={!canProceed}>
                Siguiente
              </Button>
            </Box>
          </Box>
        )}

        {/* STEP 1: Formulario + Preview */}
        {activeStep === 1 && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0 }}>

            <Box sx={{
              flexGrow: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' },
              gap: 2, minHeight: 0,
            }}>
              {/* Formulario */}
              <Box sx={{
                flex: 2, display: 'flex', flexDirection: 'column',
                p: 2, boxShadow: 5, borderRadius: 4, bgcolor: 'background.paper',
                overflowY: { xs: 'visible', md: 'auto' },
                maxHeight: { md: '100vh' },
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2, textAlign: 'center' }}>
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
                  <Box sx={{
                    flexGrow: 1, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Typography>Cargando propiedad…</Typography>
                  </Box>
                )}
              </Box>

              {/* Preview */}
              <Box sx={{
                display: 'flex', flexDirection: 'column',
                p: 2, boxShadow: 5, borderRadius: 4, bgcolor: 'background.paper',
                overflow: 'hidden', minHeight: 0,
                flex: { xs: 'none', md: 1 },
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2, textAlign: 'center' }}>
                  Previsualización de Imágenes
                </Typography>

                <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                  <PropertyPreview
                    main={main}
                    images={gallery}
                    onDelete={handleDeleteImg}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 1, display: { xs: "none", md: "flex" }, justifyContent: 'flex-end', flexShrink: 0 }}>
              <Button variant="contained" onClick={() => setActiveStep(0)}>
                Volver
              </Button>
            </Box>
          </Box>
        )}

        {DialogUI}
      </Box>
    </BasePage>
  );
}
