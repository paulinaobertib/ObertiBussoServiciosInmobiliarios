import {
    Box, Button, Container, Stepper, Step, StepLabel, CircularProgress, useTheme, IconButton, useMediaQuery,
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import { useNavigate } from 'react-router-dom';

import { BasePage } from './BasePage';
import { useManageContractPage } from '../app/user/hooks/contracts/useManageContractPage';
import { PropertySection } from '../app/property/components/properties/PropertySection';
import { UsersSection } from '../app/user/components/users/panel/UsersSection';
import { ContractForm } from '../app/user/components/contracts/ContractForm';

export default function ManageContractPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const ctrl = useManageContractPage();

    const steps = ['Propiedad', 'Usuario', 'Datos'];
    const canProceed = ctrl.canProceed();

    // Loader
    if (ctrl.loading) {
        return (
            <BasePage>
                <Container sx={{ py: 8, textAlign: 'center' }}>
                    <CircularProgress />
                </Container>
            </BasePage>
        );
    }

    return (
        <>
            {/* Botón de regresar flotante */}
            <IconButton
                size="small"
                onClick={() => navigate(-1)}
                sx={{ position: 'relative', top: 64, left: 8, zIndex: 1300 }}
            >
                <ReplyIcon />
            </IconButton>

            <BasePage showFooter={false}>
                <Container
                    maxWidth={false}
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        minHeight: 0,
                    }}
                >
                    {/* Barra superior con navegación y controles */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                            flexShrink: 0,
                            gap: 2,
                        }}
                    >
                        {/* Cancelar */}
                        <Button variant="outlined" onClick={ctrl.cancel}>
                            CANCELAR
                        </Button>

                        {/* Navegación móvil */}
                        {isMobile && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {ctrl.activeStep === 0 && (
                                    <Button
                                        variant="contained"
                                        onClick={() => ctrl.setActiveStep(1)}
                                        disabled={!canProceed}
                                    >
                                        Siguiente
                                    </Button>
                                )}
                                {ctrl.activeStep === 1 && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            onClick={() => ctrl.setActiveStep(0)}
                                        >
                                            Volver
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => ctrl.setActiveStep(2)}
                                            disabled={!canProceed}
                                        >
                                            Siguiente
                                        </Button>
                                    </>
                                )}
                                {ctrl.activeStep === 2 && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => ctrl.setActiveStep(1)}
                                    >
                                        Volver
                                    </Button>
                                )}
                            </Box>
                        )}


                        {/* Stepper desktop */}
                        {!isMobile && (
                            <Stepper activeStep={ctrl.activeStep} alternativeLabel sx={{ flexGrow: 1, mx: 2 }}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        )}

                        {/* Guardar sólo en último paso */}
                        {isMobile && ctrl.activeStep === 2 && (
                            <Button
                                variant="contained"
                                onClick={ctrl.save}
                                disabled={!canProceed || ctrl.loading}
                            >
                                {ctrl.contract ? 'Actualizar' : 'Crear'}
                            </Button>
                        )}

                        {/* Guardar sólo en último paso */}
                        {!isMobile && (
                            <Button
                                variant="contained"
                                onClick={ctrl.save}
                                disabled={ctrl.loading || !ctrl.formReady}
                            >
                                GUARDAR
                            </Button>
                        )}

                    </Box>

                    {/* Contenido de pasos */}
                    {ctrl.activeStep === 0 && (
                        <Box sx={{ flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>
                            <PropertySection
                                toggleSelect={ctrl.setSelectedPropertyId}
                                isSelected={(id) => id === ctrl.selectedPropertyId}
                            />
                        </Box>
                    )}

                    {ctrl.activeStep === 1 && (
                        <Box sx={{ flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>
                            <UsersSection
                                toggleSelect={ctrl.setSelectedUserId}
                                isSelected={(id) => id === ctrl.selectedUserId}
                            />
                        </Box>
                    )}

                    {ctrl.activeStep === 2 && (
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, minHeight: 0 }}>
                            <ContractForm
                                ref={ctrl.formRef}
                                initialPropertyId={ctrl.selectedPropertyId!}
                                initialUserId={ctrl.selectedUserId!}
                                initialData={ctrl.contract!}
                                onValidityChange={ctrl.setFormReady}
                            />
                        </Box>
                    )}

                    {/* Navegación inferior desktop */}
                    {!isMobile && (
                        <Box
                            sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'flex-end', flexShrink: 0, gap: 1 }}
                        >
                            {ctrl.activeStep === 0 && (
                                <Button
                                    variant="contained"
                                    onClick={() => ctrl.setActiveStep(1)}
                                    disabled={!canProceed}
                                >
                                    Siguiente
                                </Button>
                            )}
                            {ctrl.activeStep === 1 && (
                                <>
                                    <Button
                                        variant="outlined"
                                        onClick={() => ctrl.setActiveStep(0)}
                                    >
                                        Volver
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => ctrl.setActiveStep(2)}
                                        disabled={!canProceed}
                                    >
                                        Siguiente
                                    </Button>
                                </>
                            )}
                            {ctrl.activeStep === 2 && (
                                <Button
                                    variant="outlined"
                                    onClick={() => ctrl.setActiveStep(1)}
                                >
                                    Volver
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Confirm Dialog */}
                    {ctrl.DialogUI}
                </Container>
            </BasePage>
        </>
    );
}
