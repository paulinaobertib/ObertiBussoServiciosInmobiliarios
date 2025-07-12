import {
    Box, Button, Container, Typography,
    Stepper, Step, StepLabel, CircularProgress, useTheme,
} from '@mui/material';

import { BasePage } from './BasePage';
import { PanelManager } from '../app/shared/components/PanelManager';
import { CategoryPanel } from '../app/property/components/CategorySection';
import { PropertyForm } from '../app/property/components/forms/PropertyForm';
import { PropertyPreview } from '../app/property/components/images/ImagePreview';

import { useManagePropertyPage } from '../app/property/hooks/useManagePropertyPage';

export default function ManagePropertyPage() {
    const theme = useTheme();
    const ctrl = useManagePropertyPage();

    /* ---------- loader mientras trae datos ---------- */
    if (ctrl.loading) {
        return (
            <BasePage>
                <Container sx={{ py: 8, textAlign: 'center' }}>
                    <CircularProgress />
                </Container>
            </BasePage>
        );
    }

    /* ---------- panels para el paso 0 ---------- */
    const categoryPanels = [
        { key: 'type', label: 'Tipos', content: <CategoryPanel category="type" /> },
        { key: 'neighborhood', label: 'Barrios', content: <CategoryPanel category="neighborhood" /> },
        { key: 'owner', label: 'Propietarios', content: <CategoryPanel category="owner" /> },
        { key: 'amenity', label: 'Características', content: <CategoryPanel category="amenity" /> },
    ];

    return (
        <BasePage maxWidth>
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',   /* ← nunca scroll global */
                minHeight: 0,
            }}>

                <Container
                    maxWidth={false}
                    sx={{
                        flexGrow: 1, display: 'flex', flexDirection: 'column',
                        minHeight: 0, overflow: 'hidden'
                    }}
                >

                    {/* ---------- barra superior ---------- */}
                    <Box sx={{ justifyContent: 'center', display: 'flex', alignItems: 'center', mb: 1, flexShrink: 0 }}>
                        {/* VOLVER (solo XS) */}
                        <Button
                            variant="contained"
                            onClick={() => ctrl.setActiveStep(0)}
                            sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
                        >
                            Volver
                        </Button>

                        {/* CANCELAR */}
                        <Button variant="outlined" onClick={ctrl.cancel} sx={{ mr: 2 }}>
                            CANCELAR
                        </Button>

                        {/* STEPPER (oculto en XS) */}
                        <Box sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
                            <Stepper activeStep={ctrl.activeStep} alternativeLabel>
                                <Step><StepLabel>Categorías</StepLabel></Step>
                                <Step><StepLabel>Formulario</StepLabel></Step>
                            </Stepper>
                        </Box>

                        {/* GUARDAR */}
                        <Button
                            variant="contained"
                            onClick={ctrl.save}
                            disabled={ctrl.loading || !ctrl.formReady}
                        >
                            GUARDAR
                        </Button>
                    </Box>

                    {/* ---------- STEP 0 : categorías ---------- */}
                    {ctrl.activeStep === 0 && (
                        <Box sx={{
                            flexGrow: 1, display: 'flex', flexDirection: 'column',
                            minHeight: 0, overflow: 'hidden'
                        }}>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 2, textAlign: 'center' }}
                            >
                                Gestión de Categorías
                            </Typography>

                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                                <PanelManager panels={categoryPanels} direction="row" />
                            </Box>

                            <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => ctrl.setActiveStep(1)}
                                    disabled={!ctrl.canProceed}
                                >
                                    Siguiente
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* ---------- STEP 1 : formulario + preview ---------- */}
                    {ctrl.activeStep === 1 && (
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0 }}>

                            <Box sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: 2,
                                minHeight: 0,
                            }}>
                                {/* ---- formulario ---- */}
                                <Box sx={{
                                    flex: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    p: 2,
                                    boxShadow: 5,
                                    borderRadius: 4,
                                    bgcolor: 'background.paper',
                                    overflowY: { xs: 'visible', md: 'auto' },
                                    maxHeight: { md: '100vh' },
                                }}>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2, textAlign: 'center' }}
                                    >
                                        {ctrl.title}
                                    </Typography>

                                    <PropertyForm
                                        ref={ctrl.formRef}
                                        initialData={ctrl.property || undefined}
                                        onImageSelect={ctrl.handleImages}
                                        onValidityChange={ctrl.setFormReady}
                                    />

                                </Box>

                                {/* ---- preview ---- */}
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    p: 2,
                                    boxShadow: 5,
                                    borderRadius: 4,
                                    bgcolor: 'background.paper',
                                    overflow: 'hidden',
                                    minHeight: 0,
                                    flex: { xs: 'none', md: 1 },
                                }}>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2, textAlign: 'center' }}
                                    >
                                        Previsualización de Imágenes
                                    </Typography>

                                    <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                                        <PropertyPreview
                                            main={ctrl.img.mainImage}
                                            images={ctrl.img.gallery}
                                            onDelete={ctrl.img.remove}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            {/* botón volver (solo MD+) */}
                            <Box sx={{ mt: 1, mb: 2, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', flexShrink: 0 }}>
                                <Button variant="contained" onClick={() => ctrl.setActiveStep(0)}>
                                    Volver
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {ctrl.DialogUI}
                </Container>
            </Box>
        </BasePage>
    );
}
