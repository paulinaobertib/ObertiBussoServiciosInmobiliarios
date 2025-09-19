import {
  Box,
  Button,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  useTheme,
  Card,
} from "@mui/material";
import { BasePage } from "./BasePage";
import { PanelManager } from "../app/shared/components/PanelManager";
import { CategorySection } from "../app/property/components/categories/CategorySection";
import { PropertyForm } from "../app/property/components/forms/PropertyForm";
import { ImagePreview } from "../app/shared/components/images/ImagePreview";
import { useManagePropertyPage } from "../app/property/hooks/useManagePropertyPage";
import { useEffect } from "react";
import { usePropertiesContext } from "../app/property/context/PropertiesContext"; //items seleccionados

export default function ManagePropertyPage() {
  const theme = useTheme();
  const ctrl = useManagePropertyPage();
  const {
    seedSelectionsFromProperty, // metodo nuevo del contexto
    selected,                   // ids seleccionados en categorías
    amenitiesList,
    ownersList,
    neighborhoodsList,
    typesList,
  } = usePropertiesContext();

  // Si estoy editando, preselecciono en la grilla lo que la propiedad ya tiene
  useEffect(() => {
    seedSelectionsFromProperty(ctrl.property ?? null);
  }, [ctrl.property?.id, seedSelectionsFromProperty]);

  const goToFormStep = () => {
    const ref = ctrl.formRef.current;
    if (!ref) {
      ctrl.setActiveStep(1);
      return;
    }

    if (selected.type != null) {
      const t = typesList.find(x => x.id === selected.type);
      if (t) ref.setField("type", t as any);
    }
    if (selected.neighborhood != null) {
      const n = neighborhoodsList.find(x => x.id === selected.neighborhood);
      if (n) ref.setField("neighborhood", n as any);
    }
    if (selected.owner != null) {
      const o = ownersList.find(x => x.id === selected.owner);
      if (o) ref.setField("owner", o as any);
    }
    const ams = amenitiesList.filter(a => selected.amenities.includes(a.id));
    ref.setField("amenities", ams as any);

    ctrl.setActiveStep(1);
  };

  /* ---------- loader ---------- */
  if (ctrl.loading) {
    return (
      <BasePage>
        <Container sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      </BasePage>
    );
  }

  /* ---------- panels paso 0 ---------- */
  const CategorySections = [
    { key: "type", label: "Tipos", content: <CategorySection category="type" /> },
    { key: "neighborhood", label: "Barrios", content: <CategorySection category="neighborhood" /> },
    { key: "owner", label: "Propietarios", content: <CategorySection category="owner" /> },
    { key: "amenity", label: "Características", content: <CategorySection category="amenity" /> },
  ];

  return (
    <BasePage showFooter={false}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* ---------- barra superior ---------- */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
            my: 1,
          }}
        >
          {/* Cancelar a la izquierda */}
          <Button variant="outlined" onClick={ctrl.cancel}>
            Cancelar
          </Button>

          {/* Stepper (desktop) */}
          <Box sx={{ display: { xs: "none", md: "block" }, flexGrow: 1 }}>
            <Stepper activeStep={ctrl.activeStep} alternativeLabel>
              <Step>
                <StepLabel>Categorías</StepLabel>
              </Step>
              <Step>
                <StepLabel>Formulario</StepLabel>
              </Step>
            </Stepper>
          </Box>

          {/* Grupo de acciones a la derecha */}
          <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
            {ctrl.activeStep === 0 && (
              <Button
                variant="contained"
                onClick={goToFormStep}        // items seleccionados
                disabled={!ctrl.canProceed}
              >
                Siguiente
              </Button>
            )}

            {ctrl.activeStep === 1 && (
              <>
                <Button variant="outlined" onClick={() => ctrl.setActiveStep(0)}>
                  Volver
                </Button>
                <Button variant="contained" onClick={ctrl.save} disabled={ctrl.loading || !ctrl.formReady}>
                  {ctrl.property ? "Actualizar" : "Crear"}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* ---------- STEP 0 : categorías ---------- */}
        {ctrl.activeStep === 0 && (
          <>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
                textAlign: "center",
              }}
            >
              Gestión de Categorías
            </Typography>

            <PanelManager panels={CategorySections} />
          </>
        )}

        {/* ---------- STEP 1 : formulario + preview ---------- */}
        {ctrl.activeStep === 1 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              alignItems: 'stretch',
            }}
          >
            {/* Formulario */}
            <Card
              sx={{
                flex: 2,
                display: "flex",
                flexDirection: "column",
                p: 3,
                gap: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 1,
                  textAlign: "center",
                }}
              >
                {ctrl.title}
              </Typography>

              <PropertyForm
                ref={ctrl.formRef}
                initialData={ctrl.property || undefined}
                img={ctrl.img}
                onValidityChange={ctrl.setFormReady}
              />
            </Card>
            {/* Preview */}
            <Card
              sx={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                p: 2,
                gap: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  mb: 1,
                  textAlign: "center",
                }}
              >
                Previsualización de Imágenes
              </Typography>

              <ImagePreview
                fullSizeSingle={false}
                main={ctrl.img.mainImage}
                images={ctrl.img.gallery}
                onDelete={ctrl.img.remove}
              />
            </Card>
          </Box>
        )}

        {/* ---------- dialog ---------- */}
        {ctrl.DialogUI}
      </Box>
    </BasePage>
  );
}
