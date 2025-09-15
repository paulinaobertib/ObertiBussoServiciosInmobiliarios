import { useState, useEffect, ChangeEvent } from "react";
import { Box, TextField, Grid, MenuItem } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { postCommission, putCommission, deleteCommission } from "../../services/commission.service";
import type { Commission, CommissionCreate } from "../../types/commission";
import { CommissionPaymentType, CommissionStatus } from "../../types/commission";
import { PaymentCurrency } from "../../types/payment";

type Action = "add" | "edit" | "delete";

export interface Props {
  action?: Action; // puede o no venir, derivamos si falta
  item?: Commission;
  contractId?: number;
  onSuccess?: () => void; // cerrar/refresh en el padre
}

type FormState = {
  id?: number;
  currency: PaymentCurrency | "";
  totalAmount: number | "";
  date: string;
  paymentType: CommissionPaymentType | "";
  installments: number | "";
  status: CommissionStatus | "";
  note: string;
  contractId: number | "";
};

export const CommissionForm = ({ action, item, contractId, onSuccess }: Props) => {
  const { showAlert } = useGlobalAlert();

  // Derivación de modo segura
  const mode: Action = action ?? (item && item.id ? "edit" : "add");
  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    id: item?.id,
    currency: "",
    totalAmount: "",
    date: "",
    paymentType: "",
    installments: "",
    status: "",
    note: "",
    contractId: "",
  });

  // Precarga en edición (solo si hay item con id) y setea contractId si viene por props
  useEffect(() => {
    if (isEdit && item && item.id != null) {
      setForm({
        id: item.id,
        currency: item.currency,
        totalAmount: item.totalAmount,
        date: (item.date || "").split("T")[0] ?? "",
        paymentType: item.paymentType,
        installments: item.installments,
        status: item.status,
        note: item.note ?? "",
        contractId: item.contractId,
      });
    } else if (isAdd && contractId && contractId > 0) {
      setForm((prev) => ({ ...prev, contractId }));
    }
  }, [isAdd, isEdit, item, contractId]);

  // Si cambia a COMPLETO, forzar cuotas=1
  useEffect(() => {
    if (form.paymentType === CommissionPaymentType.COMPLETO) {
      setForm((prev) => ({ ...prev, installments: 1 }));
    }
  }, [form.paymentType]);

  const handleChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    let value: any = e.target.value;
    if (field === "totalAmount" || field === "installments" || field === "contractId") {
      value = value === "" ? "" : Number(value);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const paymentTypes = Object.values(CommissionPaymentType) as CommissionPaymentType[];
  const statuses = Object.values(CommissionStatus) as CommissionStatus[];

  const labelize = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : "");
  const isCuotas = form.paymentType === CommissionPaymentType.CUOTAS;

  // === ✅ VALIDACIÓN SIMPLE (reemplaza tu formValid) ===
  const hasContract =
    (contractId != null && Number(contractId) > 0) || (form.contractId !== "" && Number(form.contractId) > 0);

  const isValid = isDelete
    ? true
    : hasContract &&
      Number(form.totalAmount) > 0 &&
      !!form.currency &&
      !!form.date &&
      !!form.status &&
      !!form.paymentType &&
      (!isCuotas || Number(form.installments) > 0);

  const handleSubmit = async (): Promise<void> => {
    if (!isValid) {
      showAlert("Completa los campos obligatorios", "warning");
      return;
    }

    try {
      setSaving(true);

      if (isDelete) {
        if (!form.id) throw new Error("Falta el ID para eliminar.");
        await deleteCommission(form.id);
        showAlert("Comisión eliminada con éxito.", "success");
        onSuccess?.();
        return;
      }

      const payload: CommissionCreate = {
        currency: form.currency as PaymentCurrency,
        totalAmount: Number(form.totalAmount),
        date: form.date,
        paymentType: form.paymentType as CommissionPaymentType,
        installments: isCuotas ? Number(form.installments) : 1, // si es COMPLETO, 1
        status: form.status as CommissionStatus,
        note: form.note,
        contractId: (contractId as number) || Number(form.contractId),
      };

      if (isAdd) {
        await postCommission(payload);
        showAlert("Comisión creada correctamente.", "success");
      } else if (isEdit) {
        if (!form.id) throw new Error("Falta el ID para editar.");
        await putCommission({ ...payload, id: form.id } as Commission);
        showAlert("Comisión actualizada correctamente.", "success");
      } else {
        throw new Error("Acción desconocida.");
      }

      onSuccess?.();
    } catch (err: any) {
      showAlert(err?.message || "Ocurrió un error al guardar.", "error");
    } finally {
      setSaving(false);
    }
  };

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
            onChange={handleChange("totalAmount")}
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
            onChange={handleChange("currency")}
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
            onChange={handleChange("date")}
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
            onChange={handleChange("status")}
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
            onChange={handleChange("paymentType")}
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
            onChange={handleChange("installments")}
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
            onChange={handleChange("note")}
            disabled={isDelete}
          />
        </Grid>

        {/* Botón interno, como en AmenityForm */}
        <Grid size={{ xs: 12 }}>
          <Box textAlign="right">
            <LoadingButton
              onClick={handleSubmit}
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
