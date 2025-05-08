import { useState } from 'react';
import {
  Container, Box, Typography, CircularProgress, Button,
  Stepper, Step, StepLabel, Stack
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useConfirmDialog } from '../../app/property/utils/ConfirmDialog';
import { useGlobalAlert } from '../../app/property/context/AlertContext';
import PropertyForm from '../../app/property/components/forms/PropertyForm';
import PropertyPreview from '../../app/property/components/PropertyPreview';
import { useCreateProperty } from '../../app/property/hooks/useCreateProperty';
import { usePropertyCrud } from '../../app/property/context/PropertyCrudContext';
import CategoryButton from '../../app/property/components/CategoryButton';
import CategoryItems from '../../app/property/components/CategoryItems';
import { postProperty } from '../../app/property/services/property.service';
import { Image } from '../../app/property/types/image';

export default function CreatePropertyPage() {
  const [activeStep, setActiveStep] = useState(0);
  const { formRef, gallery, setGallery, setMain, main, deleteImgFile, handleImages, loading, setLoading } = useCreateProperty();
  const { selected, allTypes, resetSelected } = usePropertyCrud();
  const { showAlert } = useGlobalAlert();
  const { ask, DialogUI } = useConfirmDialog();
  const [formReady, setFormReady] = useState(false);

  const categories = ['type', 'neighborhood', 'owner', 'amenity'] as const;

  const canProceed = categories.every((k) =>
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
    });

  const handleDeleteImg = (img: Image) => {
    if (img instanceof File) deleteImgFile(img);
  };

  const selectedTypeName =
    Array.isArray(allTypes) && allTypes.length ? allTypes.find(t => t.id === Number(selected.type))?.name ?? '' : '';

  const title = selectedTypeName ? `Formulario de Creación de ${selectedTypeName}` : 'Formulario de Creación';


  /* -------------- ⬇️  UI  ⬇️ -------------- */
  return (
    <Container maxWidth={false} sx={{ pt: 2, height: '97vh', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Paso 0: título/stepper */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Button variant="outlined" onClick={cancel} sx={{ mr: 2 }}>
          CANCELAR
        </Button>

        <Box sx={{ flexGrow: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            <Step><StepLabel>Categorías</StepLabel></Step>
            <Step><StepLabel>Formulario</StepLabel></Step>
          </Stepper>
        </Box>

        <Button
          variant="contained"
          onClick={save}
          disabled={!formReady}
        >
          GUARDAR
        </Button>
      </Box>

      {/* Loader */}
      {loading && (
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 10,
          bgcolor: 'rgba(255,255,255,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <CircularProgress size={48} />
        </Box>
      )}

      {/* -------- Paso 1: categorías -------- */}
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
            flexGrow: 1,
            width: '100%',
            maxWidth: '96vw',
            mx: 'auto',
            boxShadow: 2,
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
          }}>
            <CategoryItems />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={() => setActiveStep(1)}
              disabled={!canProceed}
            >
              Siguiente
            </Button>
          </Box>
        </Box>
      )}

      {/* -------- Paso 2: formulario + preview -------- */}
      {activeStep === 1 && (
        <Box sx={{ width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: 'stretch',
              flexGrow: 1,
              minHeight: 0,          /* ⬅️ clave para evitar expansión */
            }}
          >
            {/* ---------- Formulario ---------- */}
            <Box
              sx={{
                flex: 2,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                borderRadius: 4,
                boxShadow: 5,
                bgcolor: 'background.paper',
                minHeight: 0,        /* permite que el panel vecino controle la altura */
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF6C00', mb: 2, textAlign: 'center' }}>
                {title}
              </Typography>

              {selected.type ? (
                <PropertyForm key={selected.type} ref={formRef} onImageSelect={handleImages} onValidityChange={setFormReady}
                />
              ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Seleccioná un tipo de propiedad para comenzar.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* ----------- Preview ------------ */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 4,
                boxShadow: 5,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',  /* no deja salir nada */
                minHeight: 0,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF6C00', mb: 2, textAlign: 'center' }}>
                Previsualización de Imágenes
              </Typography>

              {/* área que SÍ puede scrollear */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                <PropertyPreview main={main} images={gallery} onDelete={handleDeleteImg} />
              </Box>
            </Box>
          </Box>

          {/* -------- Botones ------------- */}
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>

            <Button variant="contained" onClick={() => setActiveStep(0)} sx={{ mr: 2 }}>
              Volver
            </Button>

          </Box>
        </Box>
      )}

      {DialogUI}
    </Container>
  );
}