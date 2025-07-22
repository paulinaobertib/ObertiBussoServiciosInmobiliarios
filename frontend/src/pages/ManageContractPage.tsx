import {
    Box, Button, Container, Typography,
    Stepper, Step, StepLabel, useTheme,
    IconButton,
} from '@mui/material';
import { BasePage } from './BasePage';
import { PanelManager } from '../app/shared/components/PanelManager';
import ReplyIcon from '@mui/icons-material/Reply';
import { useNavigate } from 'react-router-dom';
import { useManageContractPage } from '../app/user/hooks/useManageContractPage';
import { PropertySection } from '../app/property/components/properties/PropertySection';
import { UsersSection } from '../app/user/components/users/panel/UsersSection';
import { ContractForm } from '../app/user/components/contracts/ContractForm';

export default function ManageContractPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const ctrl = useManageContractPage();

    // ─── Levantamos selección en los panels ───
    const Sections = [
        {
            key: 'property',
            label: 'Propiedades',
            content: (
                <PropertySection
                    toggleSelect={ctrl.setSelectedPropertyId}
                    isSelected={(id) => id === ctrl.selectedPropertyId}
                />
            ),
        },
        {
            key: 'users',
            label: 'Usuarios',
            content: (
                <UsersSection
                    toggleSelect={ctrl.setSelectedUserId}
                    isSelected={(id) => id === ctrl.selectedUserId}
                />
            ),
        },
    ];

    return (
        <>
            <IconButton
                size="small"
                onClick={() => navigate(-1)}
                sx={{ position: 'relative', top: 64, left: 8, zIndex: 1300 }}
            >
                <ReplyIcon />
            </IconButton>

            <BasePage showFooter={false}>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                    <Container maxWidth={false} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

                        {/* ─── Barra superior ─── */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexShrink: 0 }}>
                            <Button variant="contained" onClick={() => ctrl.setActiveStep(0)} sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}>
                                Volver
                            </Button>
                            <Button variant="outlined" onClick={ctrl.cancel} sx={{ mr: 2 }}>
                                CANCELAR
                            </Button>
                            <Box sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
                                <Stepper activeStep={ctrl.activeStep} alternativeLabel>
                                    <Step><StepLabel>Propiedad y Usuario</StepLabel></Step>
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

                        {/* ─── STEP 0: selección ─── */}
                        {ctrl.activeStep === 0 && (
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 2, textAlign: 'center' }}>
                                    Seleccionar Items
                                </Typography>

                                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <PanelManager panels={Sections} direction="row" />
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

                        {/* ─── STEP 1: formulario … ─── */}
                        {ctrl.activeStep === 1 && (
                            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
                                <Box sx={{
                                    flex: 2, p: 2, boxShadow: 4, borderRadius: 2,
                                    bgcolor: "background.paper", overflowY: "auto",
                                }}>
                                    <Typography
                                        variant="h6"
                                        sx={{ mb: 2, fontWeight: 700, textAlign: "center", color: theme.palette.primary.main }}
                                    >
                                        {ctrl.title}
                                    </Typography>

                                    <ContractForm
                                        ref={ctrl.formRef}
                                        initialPropertyId={ctrl.selectedPropertyId!}
                                        initialUserId={ctrl.selectedUserId!}
                                        onValidityChange={ctrl.setFormReady}
                                    />
                                </Box>

                                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                                    <Button
                                        variant="contained"
                                        onClick={ctrl.save}
                                        disabled={ctrl.loading || !ctrl.formReady}
                                    >
                                        {ctrl.loading ? "Guardando…" : "Guardar"}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        sx={{ ml: 1 }}
                                        onClick={() => ctrl.setActiveStep(0)}
                                    >
                                        Volver
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {/* … */}
                    </Container>
                </Box>
            </BasePage>
        </>
    );
}
