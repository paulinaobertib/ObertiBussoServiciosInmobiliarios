import { forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Divider,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { ContractType, Contract, ContractGet } from "../../types/contract";
import { useEffect, useState } from "react";
import type { IncreaseIndex } from "../../types/increaseIndex";
import { useIncreaseIndexes } from "../../hooks/useIncreaseIndexes";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Modal } from "../../../shared/components/Modal";
import { IncreaseIndexForm } from "../increases/IncreaseIndexForm";
import { useContractForm, ContractFormValues } from "../../hooks/contracts/useContractForm";

export type ContractFormHandle = {
  submit: () => Promise<ContractFormValues | null>;
  reset: () => void;
  getCreateData: () => any;
  setGuarantorsIds: (ids: number[]) => void;
};

interface Props {
  initialPropertyId: number;
  initialUserId: string;
  initialData?: Contract | ContractGet;
  onValidityChange?: (v: boolean) => void;
}

export const ContractForm = forwardRef<ContractFormHandle, Props>(function ContractForm(
  { initialPropertyId, initialUserId, initialData, onValidityChange },
  ref
) {
  const { values, errors, property, user, loadingData, handleChange, reset, submit, getCreateData, setGuarantorsIds } =
    useContractForm(initialPropertyId, initialUserId, initialData, onValidityChange);

  const idx = useIncreaseIndexes();
  const [idxModalOpen, setIdxModalOpen] = useState(false);
  const [idxAction, setIdxAction] = useState<"add" | "edit" | "delete">("add");
  const [currentIdx, setCurrentIdx] = useState<IncreaseIndex | null>(null);
  useEffect(() => {
    idx.loadAll();
  }, []);

  useImperativeHandle(ref, () => ({ submit, reset, getCreateData, setGuarantorsIds }));

  if (loadingData)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Box component="form" noValidate>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography fontWeight={700}>Propiedad</Typography>
                <Typography>{property?.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography fontWeight={700}>Usuario</Typography>
                <Typography>
                  {user?.firstName} {user?.lastName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          Datos del contrato
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              required
              label="Tipo"
              size="small"
              value={values.contractType || ""}
              onChange={handleChange("contractType")}
            >
              {Object.values(ContractType).map((t) => (
                <MenuItem key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              required
              label="Estado"
              size="small"
              value={values.contractStatus || ""}
              onChange={handleChange("contractStatus")}
            >
              <MenuItem value="ACTIVO">Activo</MenuItem>
              <MenuItem value="INACTIVO">Inactivo</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="date"
              fullWidth
              required
              label="Inicio"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={values.startDate || ""}
              onChange={handleChange("startDate")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="date"
              fullWidth
              required
              label="Fin"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={values.endDate || ""}
              onChange={handleChange("endDate")}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          Datos de pagos
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="number"
              fullWidth
              required
              label="Monto inicial"
              size="small"
              inputProps={{ min: 0 }}
              value={values.initialAmount === "" ? "" : values.initialAmount}
              onChange={handleChange("initialAmount")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              required
              label="Moneda"
              size="small"
              value={values.currency || ""}
              onChange={handleChange("currency")}
            >
              <MenuItem value="ARS">Peso Argentino</MenuItem>
              <MenuItem value="USD">Dólar</MenuItem>
            </TextField>
          </Grid>

          {/* Índice de ajuste + Aumentos */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" gap={1}>
              <TextField
                select
                fullWidth
                required
                label="Seleccionar Indice"
                size="small"
                value={values.adjustmentIndexId ? String(values.adjustmentIndexId) : ""}
                onChange={handleChange("adjustmentIndexId")}
                SelectProps={{
                  renderValue: (selected) => {
                    if (!selected) return "";
                    const it = idx.indexes.find((x) => String(x.id) === String(selected));
                    return it ? it.code : "";
                  },
                }}
              >
                {idx.indexes.map((it) => (
                  <MenuItem key={it.id} value={String(it.id)}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                      <Box>{it.code}</Box>
                      {/* Iconos SOLO en la lista: prevenimos selección/cierre */}
                      <Box display="flex" gap={0.5} onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setIdxAction("edit");
                            setCurrentIdx(it);
                            setIdxModalOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setIdxAction("delete");
                            setCurrentIdx(it);
                            setIdxModalOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <Button
                size="small"
                variant="outlined"
                sx={{
                  whiteSpace: "nowrap", // ← nunca dos renglones
                  flexShrink: 0, // ← no se achica
                }}
                onClick={() => {
                  setIdxAction("add");
                  setCurrentIdx(null);
                  setIdxModalOpen(true);
                }}
              >
                Agregar índice
              </Button>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="number"
              fullWidth
              required
              label="Frecuencia de Aumento (meses)"
              size="small"
              inputProps={{ min: 1 }}
              value={values.adjustmentFrequencyMonths === "" ? "" : values.adjustmentFrequencyMonths}
              onChange={handleChange("adjustmentFrequencyMonths")}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          Extras del contrato
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Notas"
              multiline
              minRows={3}
              value={values.note}
              onChange={handleChange("note")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(values.hasDeposit)}
                  onChange={(_, checked) => {
                    handleChange("hasDeposit")({ target: { value: checked } } as any);
                    if (!checked) {
                      handleChange("depositAmount")({ target: { value: "" } } as any);
                      handleChange("depositNote")({ target: { value: "" } } as any);
                    }
                  }}
                />
              }
              label="Requiere depósito"
            />
          </Grid>

          {values.hasDeposit && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Monto del depósito"
                  value={values.depositAmount}
                  onChange={handleChange("depositAmount")}
                  error={Boolean(errors?.depositAmount)}
                  helperText={errors?.depositAmount}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Notas del depósito"
                  value={values.depositNote}
                  onChange={handleChange("depositNote")}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      <Modal
        open={idxModalOpen}
        title={idxAction === "add" ? "Nuevo índice" : idxAction === "edit" ? "Editar índice" : "Eliminar índice"}
        onClose={() => setIdxModalOpen(false)}
      >
        <IncreaseIndexForm
          action={idxAction}
          item={currentIdx ?? undefined}
          onDone={async ({ action, form }) => {
            const list = await idx.loadAll();
            if (action === "add") {
              const found = list.find((l) => l.code === form.code && l.name === form.name);
              if (found) {
                handleChange("adjustmentIndexId")({ target: { value: found.id } } as any);
              }
            }
            if (action === "delete" && currentIdx && String(values.adjustmentIndexId) === String(currentIdx.id)) {
              handleChange("adjustmentIndexId")({ target: { value: "" } } as any);
            }
            setIdxModalOpen(false);
          }}
        />
      </Modal>
    </>
  );
});
