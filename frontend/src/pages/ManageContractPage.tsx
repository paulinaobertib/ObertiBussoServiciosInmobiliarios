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
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { BasePage } from "./BasePage";
import { useEffect } from "react";
import { useManageContractPage } from "../app/user/hooks/contracts/useManageContractPage";
import { PropertySection } from "../app/property/components/properties/PropertySection";
import { UsersSection } from "../app/user/components/users/panel/UsersSection";
import { GuarantorsSection } from "../app/user/components/guarantors/GuarantorsSection";
import { UtilitiesSection } from "../app/user/components/utilities/UtilitiesSection";
import { ContractForm } from "../app/user/components/contracts/ContractForm";
// Extras integrados en ContractForm

export default function ManageContractPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const ctrl = useManageContractPage();

  const steps = ["Propiedad", "Usuario", "Datos", "Utilities"];

  // Sincroniza garantes seleccionados con el formulario (sin depender del toggle visual)
  useEffect(() => {
    const ref = ctrl.formRef.current;
    if (!ref) return;
    ref.setGuarantorsIds(ctrl.selectedGuarantorIds);
  }, [ctrl.selectedGuarantorIds, ctrl.activeStep]);

  // Loader DEBE estar después de registrar los hooks para no romper el orden
  if (ctrl.loading) {
    return (
      <BasePage>
        <Container sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      </BasePage>
    );
  }

  return (
    <BasePage showFooter={false}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
            my: 1,
          }}
        >
          <Button variant="outlined" onClick={ctrl.cancel}>
            CANCELAR
          </Button>

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

          <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
            {ctrl.activeStep === 0 && (
              <Button variant="contained" onClick={() => ctrl.setActiveStep(1)} disabled={!ctrl.canProceed()}>
                Siguiente
              </Button>
            )}

            {ctrl.activeStep === 1 && (
              <>
                <Button variant="outlined" onClick={() => ctrl.setActiveStep(0)}>
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
                <Button variant="outlined" onClick={() => ctrl.setActiveStep(1)}>
                  Volver
                </Button>
                <Button
                  variant="contained"
                  onClick={() => ctrl.setActiveStep(3)}
                  disabled={ctrl.loading || !ctrl.formReady}
                >
                  Siguiente
                </Button>
              </>
            )}

            {ctrl.activeStep === 3 && (
              <>
                <Button variant="outlined" onClick={() => ctrl.setActiveStep(2)}>
                  Volver
                </Button>
                <Button variant="contained" onClick={ctrl.save} disabled={ctrl.loading}>
                  {ctrl.contract ? "Actualizar" : "Crear"}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {ctrl.activeStep === 0 && (
          <PropertySection
            toggleSelect={ctrl.setSelectedPropertyId}
            isSelected={(id) => id === ctrl.selectedPropertyId}
            filterAvailable={true}
            showActions={false}
          />
        )}

        {ctrl.activeStep === 1 && (
          <>
            <UsersSection
              toggleSelect={ctrl.setSelectedUserId}
              isSelected={(id) => id === ctrl.selectedUserId}
              showActions={false}
            />
            <Box mt={2}>
              <FormControlLabel
                control={<Checkbox checked={ctrl.addGuarantors} onChange={(_, c) => ctrl.setAddGuarantors(c)} />}
                label="¿Agregar garantes?"
              />
              {ctrl.addGuarantors && (
                <Box mt={2}>
                  <GuarantorsSection
                    toggleSelect={(ids) => {
                      ctrl.setSelectedGuarantorIds(ids);
                      // Sincroniza con el form principal para el DTO
                      ctrl.formRef.current?.setGuarantorsIds(ids);
                    }}
                    isSelected={(id) => ctrl.selectedGuarantorIds.includes(id)}
                    showActions={true}
                  />
                </Box>
              )}
            </Box>
          </>
        )}

        {ctrl.selectedPropertyId != null && ctrl.selectedUserId != null && (
          <Box sx={{ display: ctrl.activeStep === 2 ? 'block' : 'none' }}>
            <ContractForm
              ref={ctrl.formRef}
              initialPropertyId={ctrl.selectedPropertyId}
              initialUserId={ctrl.selectedUserId}
              initialData={ctrl.contract ?? undefined}
              onValidityChange={ctrl.setFormReady}
            />
          </Box>
        )}

        {ctrl.activeStep === 3 && (
          <UtilitiesSection
            toggleSelect={(ids) => {
              console.log('[ManageContractPage] utilities selected', ids);
              ctrl.setSelectedUtilityIds(ids);
            }}
            isSelected={(id) => ctrl.selectedUtilityIds.includes(id)}
            showActions={true}
          />
        )}

        {/* Extras paso eliminado: integrados dentro del ContractForm */}

        {ctrl.DialogUI}
      </Box>
    </BasePage>
  );
}
