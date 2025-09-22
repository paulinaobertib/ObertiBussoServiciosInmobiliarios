// src/app/user/components/commission/CommissionForm.tsx
import { Box, TextField, Grid, MenuItem } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useCommissionForm } from "../../hooks/useCommissionForm";
import type { Commission } from "../../types/commission";
import { CommissionPaymentType, CommissionStatus } from "../../types/commission";

type Action = "add" | "edit" | "delete";

export interface Props {
  action?: Action;
  item?: Commission;
  contractId?: number;
  onSuccess?: () => void;
}

export const CommissionForm = ({ action, item, contractId, onSuccess }: Props) => {
  const { form, isValid, isDelete, isEdit, isCuotas, saving, handleField, submit } = useCommissionForm({
    action,
    item,
    contractId,
    onSuccess,
  });

  const paymentTypes = Object.values(CommissionPaymentType) as CommissionPaymentType[];
  const statuses = Object.values(CommissionStatus) as CommissionStatus[];

  const labelize = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : "");

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
      <Grid container spacing={2} flexGrow={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            type="number"
            fullWidth
            size="small"
            label="Monto total"
            inputProps={{ min: 0 }}
            value={form.totalAmount}
            onChange={handleField("totalAmount")}
            disabled={isDelete}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            select
            fullWidth
            size="small"
            label="Moneda"
            value={form.currency}
            onChange={handleField("currency")}
            disabled={isDelete}
          >
            <MenuItem value="ARS">Peso Argentino</MenuItem>
            <MenuItem value="USD">Dólar</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            type="date"
            fullWidth
            size="small"
            label="Fecha de Pago"
            InputLabelProps={{ shrink: true }}
            value={form.date}
            onChange={handleField("date")}
            disabled={isDelete}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            select
            fullWidth
            size="small"
            label="Estado de pago"
            value={form.status}
            onChange={handleField("status")}
            disabled={isDelete}
          >
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>
                {labelize(s)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            select
            fullWidth
            size="small"
            label="Tipo de pago"
            value={form.paymentType}
            onChange={handleField("paymentType")}
            disabled={isDelete}
          >
            {paymentTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {labelize(t)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            type="number"
            fullWidth
            size="small"
            label="Cuotas"
            inputProps={{ min: 1 }}
            value={isCuotas ? (form.installments === "" ? 1 : form.installments) : 1}
            onChange={handleField("installments")}
            disabled={!isCuotas || isDelete}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            label="Notas"
            multiline
            minRows={3}
            value={form.note}
            onChange={handleField("note")}
            disabled={isDelete}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box textAlign="right">
            <LoadingButton
              onClick={submit}
              loading={saving}
              disabled={!isValid || saving}
              variant="contained"
              color={isDelete ? "error" : "primary"}
            >
              {isDelete ? "Eliminar" : isEdit ? "Guardar" : "Confirmar"}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
