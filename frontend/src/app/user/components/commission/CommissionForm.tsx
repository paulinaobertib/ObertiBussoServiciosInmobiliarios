import { useState, useEffect, ChangeEvent, forwardRef, useImperativeHandle } from "react";
import { Box, TextField, Grid, MenuItem } from "@mui/material";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { postCommission, putCommission, deleteCommission } from "../../services/commission.service";
import type { Commission, CommissionCreate } from "../../types/commission";
import { CommissionPaymentType, CommissionStatus } from "../../types/commission";
import { PaymentCurrency } from "../../types/payment";

type Action = "add" | "edit" | "delete";

export interface Props {
  action?: Action;
  item?: Commission;
  contractId?: number;
  onSuccess?: () => void;
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

export type CommissionFormHandle = { submit: () => Promise<boolean> };

export const CommissionForm = forwardRef<CommissionFormHandle, Props>(function CommissionForm(
  { action = "add", item, contractId, onSuccess },
  ref
) {
  const { showAlert } = useGlobalAlert();

  const isAdd = action === "add";
  const isEdit = action === "edit";
  const isDelete = action === "delete";

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

  const [, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && item) {
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
    }
  }, [isEdit, item]);

  const handleChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    let value: any = e.target.value;
    if (field === "totalAmount" || field === "installments" || field === "contractId") {
      value = value === "" ? "" : Number(value);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const currencies = Object.values(PaymentCurrency) as PaymentCurrency[];
  const paymentTypes = Object.values(CommissionPaymentType) as CommissionPaymentType[];
  const statuses = Object.values(CommissionStatus) as CommissionStatus[];
  const labelize = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : "");

  const isCuotas = form.paymentType === CommissionPaymentType.CUOTAS;

  const formValid = (() => {
    if (isDelete) return true;
    const hasContract =
      (contractId != null && Number(contractId) > 0) || (form.contractId !== "" && Number(form.contractId) > 0);
    const amtOk = form.totalAmount !== "" && Number(form.totalAmount) > 0;
    const dateOk = Boolean(form.date);
    const instOk = !isCuotas || (form.installments !== "" && Number(form.installments) > 0);
    return (
      hasContract &&
      amtOk &&
      dateOk &&
      instOk &&
      Boolean(form.currency) &&
      Boolean(form.paymentType) &&
      Boolean(form.status)
    );
  })();

  const handleSubmit = async (): Promise<boolean> => {
    if (!formValid) {
      showAlert("Completa los campos obligatorios", "warning");
      return false;
    }
    setSaving(true);
    try {
      if (isAdd) {
        const body: CommissionCreate = {
          currency: form.currency as PaymentCurrency,
          totalAmount: Number(form.totalAmount),
          date: form.date,
          paymentType: form.paymentType as CommissionPaymentType,
          installments: isCuotas ? Number(form.installments) : 1,
          status: form.status as CommissionStatus,
          note: form.note,
          contractId: Number(contractId ?? form.contractId),
        };
        await postCommission(body);
        showAlert("Comisión creada con éxito", "success");
      } else if (isDelete && form.id) {
        await deleteCommission(form.id);
        showAlert("Comisión eliminada con éxito", "success");
      } else {
        const payload: Commission = {
          id: form.id!,
          currency: form.currency as PaymentCurrency,
          totalAmount: Number(form.totalAmount),
          date: form.date,
          paymentType: form.paymentType as CommissionPaymentType,
          installments: isCuotas ? Number(form.installments) : 1,
          status: form.status as CommissionStatus,
          note: form.note,
          contractId: Number(form.contractId),
        };
        await putCommission(payload);
        showAlert("Comisión actualizada con éxito", "success");
      }
      onSuccess?.();
      return true;
    } catch (err: any) {
      console.error("[CommissionForm] submit error", err);
      const msg = err?.response?.data ?? "Error desconocido";
      showAlert(msg, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
      <Grid container spacing={2} flexGrow={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
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
            type="date"
            fullWidth
            size="small"
            label="Fecha"
            InputLabelProps={{ shrink: true }}
            value={form.date}
            onChange={handleChange("date")}
            disabled={isDelete}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
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
      </Grid>
    </Box>
  );
});
