import { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Container, Stack,
  Step, StepLabel, Stepper, Typography
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';

/* hooks, contextos y servicios (sin cambios) */
import { useCreateProperty } from '../app/property/hooks/useCreateProperty';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';
import { useConfirmDialog } from '../app/property/utils/ConfirmDialog';
import { useGlobalAlert } from '../app/property/context/AlertContext';
import PropertyForm from '../app/property/components/forms/PropertyForm';
import PropertyPreview from '../app/property/components/PropertyPreview';
import CategoryButton from '../app/property/components/CategoryButton';
import CategoryItems from '../app/property/components/CategoryItems';
import { postProperty } from '../app/property/services/property.service';
import { ROUTES } from '../lib';
import { BasePage } from './BasePage';

export default function CreatePropertyPage() {
  /* ---------------- estado y hooks ---------------- */
  const {
    formRef, gallery, setGallery, setMain, main,
    deleteImgFile, handleImages, loading, setLoading
  } = useCreateProperty();
  const { selected, typesList, resetSelected, pickItem } = usePropertyCrud();
  const { showAlert } = useGlobalAlert();
  const { ask, DialogUI } = useConfirmDialog();

  const [activeStep, setActiveStep] = useState(0);
  const [formReady, setFormReady] = useState(false);
  const navigate = useNavigate();

  /* limpiar estado al entrar -------------------------------------- */
  useEffect(() => {
    pickItem('category', null);
    resetSelected();
    setMain(null);
    setGallery([]);
  }, []);

  /* categorías necesarias para continuar -------------------------- */
  const categories = ['type', 'neighborhood', 'owner', 'amenity'] as const;
  const canProceed = categories.every(k =>
    k === 'amenity' ? selected.amenities.length > 0 : Boolean(selected[k])
  );

  const save = () =>
    ask('¿Guardar la propiedad?', async () => {
      const valid = await formRef.current?.submit();
      if (valid) {
        try {
          const data = formRef.current?.getCreateData();
          if (data) {
            setLoading(true);
            await postProperty(data);
            setLoading(false);
          }
          showAlert('¡Propiedad creada correctamente!', 'success');
          formRef.current?.reset();
          resetSelected();
          setMain(null);
          setGallery([]);

          /* redirige al catálogo */
          navigate(ROUTES.HOME_APP);

        } catch {
          showAlert('Error al guardar la propiedad', 'error');
        }
      } else {
        showAlert('Formulario inválido', 'error');
      }
    });

  const cancel = () =>
    ask('¿Cancelar los cambios?', () => {
      formRef.current?.reset();
      resetSelected();
      setMain(null);
      setGallery([]);
      showAlert('Formulario vaciado correctamente', 'info');
      navigate(ROUTES.HOME_APP);
    });

  /* nombre del tipo de propiedad (para el título) ------------------ */
  const selectedTypeName =
    typesList.find(t => t.id === Number(selected.type))?.name ?? '';

  const title = selectedTypeName
    ? `Formulario de Creación de ${selectedTypeName}`
    : 'Formulario de Creación';

  /* ---------------- ⬇  UI  ⬇ ------------------------------------- */
  return (
    <BasePage maxWidth={true}>

      {/* wrapper que ocupa EXACTAMENTE la pantalla restante */}
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',          /* no scroll exterior */
      }}>
        <Container
          maxWidth={false}
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 0, overflow: 'hidden' }}
        >

          {/* ------- barra superior (stepper + botones) ------- */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexShrink: 0 }}>
            <Button variant="outlined" onClick={cancel} sx={{ mr: 2 }}>
              CANCELAR
            </Button>

            <Box sx={{ flexGrow: 1 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                <Step><StepLabel>Categorías</StepLabel></Step>
                <Step><StepLabel>Formulario</StepLabel></Step>
              </Stepper>
            </Box>

            <Button variant="contained" onClick={save} disabled={!formReady}>
              GUARDAR
            </Button>
          </Box>

          {/* loader central */}
          {loading && (
            <Box sx={{
              position: 'absolute', inset: 0, zIndex: 10,
              bgcolor: 'rgba(255,255,255,0.7)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <CircularProgress size={48} />
            </Box>
          )}

          {/* ------- STEP 0 : categorías ------- */}
          {activeStep === 0 && (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* título */}
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#EF6C00', mb: 2, textAlign: 'center' }}>
                Gestión de Categorías
              </Typography>

              {/* botones categoría */}
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
                {categories.map((cat, i) => (
                  <Box key={cat} sx={{ display: 'flex', alignItems: 'center' }}>
                    <CategoryButton category={cat} />
                    {i < categories.length - 1 && <NavigateNextIcon sx={{ mx: 0.5, color: '#BDBDBD' }} />}
                  </Box>
                ))}
              </Stack>

              {/* panel items */}
              <Box sx={{
                flexGrow: 1, mx: 'auto', width: '100%', maxWidth: '96vw',
                display: 'flex', flexDirection: 'column',
                boxShadow: 2, borderRadius: 2, overflow: 'hidden',
                bgcolor: 'background.paper',
              }}>
                <CategoryItems />
              </Box>

              {/* botón siguiente */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                <Button variant="contained" onClick={() => setActiveStep(1)} disabled={!canProceed}>
                  Siguiente
                </Button>
              </Box>
            </Box>
          )}

          {/* ------- STEP 1 : formulario + preview ------- */}
          {activeStep === 1 && (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
              <Box sx={{
                flexGrow: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                gap: 2, minHeight: 0,
              }}>
                {/* formulario */}
                <Box sx={{
                  flex: 2, display: 'flex', flexDirection: 'column',
                  p: 2, boxShadow: 5, borderRadius: 4, bgcolor: 'background.paper'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF6C00', mb: 2, textAlign: 'center' }}>
                    {title}
                  </Typography>

                  {selected.type ? (
                    <PropertyForm
                      key={selected.type}
                      ref={formRef}
                      onImageSelect={handleImages}
                      onValidityChange={setFormReady}
                    />
                  ) : (
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">Seleccioná un tipo de propiedad para comenzar.</Typography>
                    </Box>
                  )}
                </Box>

                {/* preview */}
                <Box sx={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  p: 2, boxShadow: 5, borderRadius: 4, bgcolor: 'background.paper',
                  overflow: 'hidden', minHeight: 0,
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF6C00', mb: 2, textAlign: 'center' }}>
                    Previsualización de Imágenes
                  </Typography>

                  <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                    <PropertyPreview main={main} images={gallery} onDelete={img => img instanceof File && deleteImgFile(img)} />
                  </Box>
                </Box>
              </Box>

              {/* Verificar si selected.type tiene el valor correcto en el segundo paso */}
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                <Button variant="contained" onClick={() => {
                  console.log("Tipo seleccionado en el paso 2:", selected.type); // Agrega este log
                  setActiveStep(0);  // Si se desea volver al primer paso
                }}>
                  Volver
                </Button>
              </Box>
            </Box>
          )}

          {DialogUI}
        </Container>
      </Box>
    </BasePage>
  );
}