import {
    Box,
    Button,
    Container,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    useTheme,
    useMediaQuery,
} from '@mui/material';

import { BasePage } from './BasePage';
import { useManageContractPage } from '../app/user/hooks/contracts/useManageContractPage';
import { PropertySection } from '../app/property/components/properties/PropertySection';
import { UsersSection } from '../app/user/components/users/panel/UsersSection';
import { ContractForm } from '../app/user/components/contracts/ContractForm';

export default function ManageContractPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const ctrl = useManageContractPage();

    const steps = ['Propiedad', 'Usuario', 'Datos'];

    /* ---------- loader ---------- */
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
        <BasePage showFooter={false}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* ---------- barra superior ---------- */}
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 2,
                        my: 1,
                    }}
                >
                    {/* Cancelar a la izquierda */}
                    <Button variant="outlined" onClick={ctrl.cancel}>
                        CANCELAR
                    </Button>

                    {/* Stepper centrado (desktop) */}
                    {!isMobile && (
                        <Box sx={{ flexGrow: 1 }}>
                            <Stepper activeStep={ctrl.activeStep} alternativeLabel>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Box>
                    )}

                    {/* Navegación / Guardar a la derecha */}
                    <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                        {ctrl.activeStep === 0 && (
                            <Button
                                variant="contained"
                                onClick={() => ctrl.setActiveStep(1)}
                                disabled={!ctrl.canProceed()}
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
                                    disabled={ctrl.selectedUserId === null}
                                >
                                    Siguiente
                                </Button>
                            </>
                        )}

                        {ctrl.activeStep === 2 && (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => ctrl.setActiveStep(1)}
                                >
                                    Volver
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={ctrl.save}
                                    disabled={ctrl.loading || !ctrl.formReady}
                                >
                                    {ctrl.contract ? 'Actualizar' : 'Crear'}
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>

                {/* ---------- contenido de pasos ---------- */}
                {ctrl.activeStep === 0 && (
                    <PropertySection
                        toggleSelect={ctrl.setSelectedPropertyId}
                        isSelected={(id) => id === ctrl.selectedPropertyId}
                        filterAvailable={true}
                        showActions={false}
                    />
                )}

                {ctrl.activeStep === 1 && (
                    <UsersSection
                        toggleSelect={ctrl.setSelectedUserId}
                        isSelected={(id) => id === ctrl.selectedUserId}
                        showActions={false}
                    />
                )}

                {ctrl.activeStep === 2 && (
                    <ContractForm
                        ref={ctrl.formRef}
                        initialPropertyId={ctrl.selectedPropertyId!}
                        initialUserId={ctrl.selectedUserId!}
                        initialData={ctrl.contract!}
                        onValidityChange={ctrl.setFormReady}
                    />
                )}

                {/* ---------- confirm dialog ---------- */}
                {ctrl.DialogUI}
            </Box>
        </BasePage>
    );
}
