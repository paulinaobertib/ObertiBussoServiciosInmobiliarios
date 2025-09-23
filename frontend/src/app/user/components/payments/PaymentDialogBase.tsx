import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import dayjs from "dayjs";

import { Modal } from "../../../shared/components/Modal";
import { PaymentForm } from "./PaymentForm";
import type { Contract } from "../../types/contract";
import type { Payment } from "../../types/payment";
import { PaymentConcept } from "../../types/payment";
import { CommissionPaymentType } from "../../types/commission";

import { usePaymentDialog } from "../../hooks/usePayments";

type Props = {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
  onSaved: () => void;
  presetConcept?: PaymentConcept;
  presetUtilityId?: number;
  presetInstallment?: number | null;
  fixedConcept?: PaymentConcept;
};

export const PaymentDialog = ({
  open,
  contract,
  onClose,
  onSaved,
  presetConcept,
  presetUtilityId,
  presetInstallment,
  fixedConcept,
}: Props) => {
  const {
    // estado/acciones desde el hook
    vals,
    setVals,
    concept,
    setConcept,

    commission,
    commissionPaidCount,
    commissionPayments,
    selectedInstallment,
    setSelectedInstallment,
    expandedDescriptions,
    toggleDescription,

    utilities,
    selectedUtilityId,
    setSelectedUtilityId,

    isValid,
    saving,
    handleSave,
  } = usePaymentDialog({
    open,
    contract,
    onClose,
    onSaved,
    presetConcept,
    presetUtilityId,
    presetInstallment,
    fixedConcept,
  });

  return (
    <Modal open={open} title="Registrar Pago" onClose={onClose}>
      {/* Concept buttons */}
      {!fixedConcept && (
        <Box display="flex" justifyContent="center" my={1}>
          <ButtonGroup variant="outlined" color="primary">
            <Button
              variant={concept === PaymentConcept.ALQUILER ? "contained" : "outlined"}
              onClick={() => setConcept(PaymentConcept.ALQUILER)}
            >
              Alquiler
            </Button>
            <Button
              variant={concept === PaymentConcept.EXTRA ? "contained" : "outlined"}
              onClick={() => setConcept(PaymentConcept.EXTRA)}
            >
              Extra
            </Button>
            <Button
              variant={concept === PaymentConcept.COMISION ? "contained" : "outlined"}
              onClick={() => setConcept(PaymentConcept.COMISION)}
            >
              Comisión
            </Button>
          </ButtonGroup>
        </Box>
      )}

      {/* Concept-specific content */}
      {concept === PaymentConcept.EXTRA && (
        <Box my={1}>
          <Typography variant="subtitle2">Servicios del contrato:</Typography>
          <List dense>
            {utilities.map((u) => {
              const monthsFor: Record<string, number> = {
                UNICO: 0,
                MENSUAL: 1,
                BIMENSUAL: 2,
                TRIMESTRAL: 3,
                SEMESTRAL: 6,
                ANUAL: 12,
              };
              const labelize = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : "");
              const per = String(u.periodicity);
              const months = monthsFor[per] ?? 0;
              const last = u.lastPaidDate ? dayjs(u.lastPaidDate) : null;
              const nextDue = last && months > 0 ? last.add(months, "month") : null;
              const secondary = [
                `Periodicidad: ${labelize(per)}`,
                `Último: ${
                  last
                    ? last.format("DD/MM/YYYY") +
                      (u.lastPaidAmount
                        ? ` - $${(u.lastPaidAmount as any).toLocaleString?.() ?? u.lastPaidAmount}`
                        : "")
                    : "—"
                }`,
                per !== "UNICO" && nextDue ? `Próximo: ${nextDue.format("DD/MM/YYYY")}` : undefined,
                per === "UNICO" && last ? "Pagada" : undefined,
              ]
                .filter(Boolean)
                .join(" • ");

              return (
                <ListItem key={u.id} disablePadding>
                  <ListItemButton selected={selectedUtilityId === u.id} onClick={() => setSelectedUtilityId(u.id)}>
                    <ListItemText primary={u.name} secondary={secondary} />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {!utilities.length && (
              <Typography variant="body2" color="text.secondary">
                No hay servicios vinculados al contrato.
              </Typography>
            )}
          </List>
          <Divider sx={{ my: 1 }} />
        </Box>
      )}

      {concept === PaymentConcept.COMISION && (
        <Box my={1}>
          {!commission && (
            <Box display="flex" alignItems="center" gap={1}>
              <span>No hay comisión asignada.</span>
            </Box>
          )}
          {commission && (
            <>
              {commission.paymentType === CommissionPaymentType.CUOTAS ? (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Cuotas
                  </Typography>
                  <List dense sx={{ "& .MuiListItemButton-root": { borderRadius: 1 } }}>
                    {Array.from({ length: commission.installments }, (_, i) => i + 1).map((n) => {
                      const paid = n <= commissionPaidCount;
                      const next = Math.min(Math.max(commission.installments || 1, 1), commissionPaidCount + 1);
                      const disabled = paid || n !== next;
                      const payment = commissionPayments[n - 1] as Payment | undefined;
                      const paymentDateLabel = payment
                        ? dayjs(payment.date ?? (payment as any).paymentDate).format("DD/MM/YYYY")
                        : null;
                      const description = (payment?.description ?? "").trim();
                      const hasDescription = description.length > 0;
                      const openDescription = !!expandedDescriptions[n];
                      const handleSelect = () => {
                        if (disabled) return;
                        setSelectedInstallment(n);
                      };
                      return (
                        <ListItem
                          key={n}
                          disablePadding
                          sx={{ alignItems: "stretch" }}
                          secondaryAction={
                            <Stack spacing={0.25} alignItems="flex-end">
                              <Chip
                                size="small"
                                color={paid ? "success" : "default"}
                                label={paid ? "Pagada" : "Pendiente"}
                                sx={{ fontWeight: 600 }}
                              />
                              {paymentDateLabel && (
                                <Typography variant="caption" color="text.secondary">
                                  {paymentDateLabel}
                                </Typography>
                              )}
                            </Stack>
                          }
                        >
                          <ListItemButton
                            selected={selectedInstallment === n}
                            onClick={handleSelect}
                            sx={{
                              minHeight: 32,
                              py: 0.5,
                              pr: 7,
                              pl: 1,
                              opacity: disabled ? 0.55 : 1,
                              cursor: disabled ? "default" : "pointer",
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {hasDescription ? (
                                    <IconButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDescription(n);
                                      }}
                                      size="small"
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        border: "1px solid",
                                        borderColor: openDescription ? "primary.main" : "grey.300",
                                      }}
                                    >
                                      <InfoOutlined fontSize="inherit" color={openDescription ? "primary" : "action"} />
                                    </IconButton>
                                  ) : (
                                    <Box sx={{ width: 24, height: 24 }} />
                                  )}
                                  <Typography
                                    component="span"
                                    sx={{ fontSize: ".85rem", fontWeight: 600, color: "#000" }}
                                  >
                                    {`Cuota #${n}`}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItemButton>
                          {hasDescription && openDescription && (
                            <Typography sx={{ fontSize: ".75rem", color: "text.secondary", px: 1, pb: 0.5 }}>
                              {description}
                            </Typography>
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                </>
              ) : (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Comisión
                  </Typography>
                  <List dense sx={{ "& .MuiListItemButton-root": { borderRadius: 1 } }}>
                    {(() => {
                      const paid = commissionPaidCount > 0;
                      const payment = commissionPayments[0] as Payment | undefined;
                      const paymentDateLabel = payment
                        ? dayjs(payment.date ?? (payment as any).paymentDate).format("DD/MM/YYYY")
                        : null;
                      const description = (payment?.description ?? "").trim();
                      const hasDescription = description.length > 0;
                      const openDescription = !!expandedDescriptions[1];
                      const handleSelect = () => {
                        if (paid) return;
                        setSelectedInstallment(1);
                      };
                      return (
                        <ListItem
                          disablePadding
                          sx={{ alignItems: "stretch" }}
                          secondaryAction={
                            <Stack spacing={0.25} alignItems="flex-end">
                              <Chip
                                size="small"
                                color={paid ? "success" : "default"}
                                label={paid ? "Pagada" : "Pendiente"}
                                sx={{ fontWeight: 600 }}
                              />
                              {paymentDateLabel && (
                                <Typography variant="caption" color="text.secondary">
                                  {paymentDateLabel}
                                </Typography>
                              )}
                            </Stack>
                          }
                        >
                          <ListItemButton
                            selected={selectedInstallment === 1}
                            onClick={handleSelect}
                            sx={{
                              minHeight: 32,
                              py: 0.5,
                              pr: 7,
                              pl: 1,
                              opacity: paid ? 0.55 : 1,
                              cursor: paid ? "default" : "pointer",
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {hasDescription ? (
                                    <IconButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDescription(1);
                                      }}
                                      size="small"
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        border: "1px solid",
                                        borderColor: openDescription ? "primary.main" : "grey.300",
                                      }}
                                    >
                                      <InfoOutlined fontSize="inherit" color={openDescription ? "primary" : "action"} />
                                    </IconButton>
                                  ) : (
                                    <Box sx={{ width: 24, height: 24 }} />
                                  )}
                                  <Typography
                                    component="span"
                                    sx={{ fontSize: ".85rem", fontWeight: 600, color: "#000" }}
                                  >
                                    Pago único
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItemButton>
                          {hasDescription && openDescription && (
                            <Typography sx={{ fontSize: ".75rem", color: "text.secondary", px: 1, pb: 0.5 }}>
                              {description}
                            </Typography>
                          )}
                        </ListItem>
                      );
                    })()}
                  </List>
                </>
              )}
            </>
          )}
          <Divider sx={{ my: 1 }} />
        </Box>
      )}

      {/* Campos comunes */}
      <PaymentForm
        contractId={contract?.id ?? 0}
        initialValues={vals}
        onChange={setVals}
        externalConcept={concept}
        externalContractUtilityId={selectedUtilityId}
        hideConceptSelect
        hideUtilitySelect
        hideCommissionInfo
        disableAmount={concept === PaymentConcept.COMISION}
        disableCurrency={concept === PaymentConcept.COMISION}
      />

      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={saving || !isValid} onClick={handleSave}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </Box>
    </Modal>
  );
};
