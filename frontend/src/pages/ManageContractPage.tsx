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
import { ContractForm } from "../app/user/components/contracts/ContractForm";

export default function ManageContractPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const ctrl = useManageContractPage();

  const steps = ["Propiedad", "Usuario", "Datos"];

  useEffect(() => {
    const c = ctrl.contract;
    if (!c) return;

    // property
    const propId = (c as any).propertyId ?? (c as any).property?.id ?? null;
    if (propId != null) ctrl.setSelectedPropertyId(propId);

    // user (inquilino)
    const userId = (c as any).userId ?? (c as any).user?.id ?? null;
    if (userId != null) ctrl.setSelectedUserId(userId);

    // guarantors
    const guarantorIds: number[] = Array.isArray((c as any).guarantorIds)
      ? (c as any).guarantorIds
      : Array.isArray((c as any).guarantors)
      ? (c as any).guarantors.map((g: any) => g?.id ?? g?.guarantorId ?? g).filter((x: any) => x != null)
      : [];
    if (guarantorIds.length) {
      ctrl.setSelectedGuarantorIds(guarantorIds);
      ctrl.setAddGuarantors(true);
    }
  }, [ctrl.contract?.id]); // reacciona cuando queda cargado el contrato

  // Sincroniza garantes seleccionados con el formulario (sin depender del toggle visual)
  useEffect(() => {
    const ref = ctrl.formRef.current;
    if (!ref) return;
    ref.setGuarantorsIds(ctrl.selectedGuarantorIds);
  }, [ctrl.selectedGuarantorIds, ctrl.activeStep]);

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
                <Button variant="contained" onClick={ctrl.save} disabled={ctrl.loading || !ctrl.formReady}>
                  {ctrl.contract ? "Actualizar" : "Crear"}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {ctrl.activeStep === 0 && (
          <PropertySection
            toggleSelect={ctrl.setSelectedPropertyId} // (id: number | null) => void
            isSelected={(id: number) => id === ctrl.selectedPropertyId}
            filterAvailable
            showActions={false}
            // mantener seleccionado (number[])
            selectedIds={ctrl.selectedPropertyId != null ? [ctrl.selectedPropertyId] : []}
          />
        )}

        {ctrl.activeStep === 1 && (
          <>
            <UsersSection
              toggleSelect={ctrl.setSelectedUserId}
              isSelected={(id) => id === ctrl.selectedUserId}
              showActions={false}
              //mantener seleccionados
              selectedIds={ctrl.selectedUserId != null ? [String(ctrl.selectedUserId)] : []}
            />

            <Box mt={2}>
              <FormControlLabel
                control={<Checkbox checked={ctrl.addGuarantors} onChange={(_, c) => ctrl.setAddGuarantors(c)} />}
                label="¿Agregar garantes?"
              />

              {ctrl.addGuarantors && (
                <Box mt={2}>
                  <GuarantorsSection
                    selectedIds={ctrl.selectedGuarantorIds} // number[]
                    toggleSelect={(ids) => {
                      ctrl.setSelectedGuarantorIds(ids); // number[]
                      ctrl.formRef.current?.setGuarantorsIds(ids); // number[]
                    }}
                    isSelected={(id: number) => ctrl.selectedGuarantorIds.includes(id)}
                    showActions
                  />
                </Box>
              )}
            </Box>
          </>
        )}

        {ctrl.selectedPropertyId != null && ctrl.selectedUserId != null && (
          <Box sx={{ display: ctrl.activeStep === 2 ? "block" : "none" }}>
            <ContractForm
              ref={ctrl.formRef}
              initialPropertyId={ctrl.selectedPropertyId}
              initialUserId={ctrl.selectedUserId}
              initialData={ctrl.contract ?? undefined}
              onValidityChange={ctrl.setFormReady}
            />
          </Box>
        )}

        {ctrl.DialogUI}
      </Box>
    </BasePage>
  );
}
