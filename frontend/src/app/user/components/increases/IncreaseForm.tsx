import React, { useState, useEffect } from "react";
import { Box, TextField, MenuItem, Grid } from "@mui/material";
import type { PaymentCurrency } from "../../types/payment";

export interface IncreaseFormValues {
  date: string;
  amount: number | "";
  currency: PaymentCurrency | "";
  adjustment?: number | "";
  note?: string;
}

interface Props {
  initialValues?: Partial<IncreaseFormValues>;
  onChange: (vals: IncreaseFormValues) => void;
}

export const IncreaseForm = ({ initialValues, onChange }: Props) => {
  const currencies = ["ARS", "USD"] as PaymentCurrency[];
  const currencyLabel = (c: PaymentCurrency | "") => (c === "ARS" ? "Peso argentino" : c === "USD" ? "Dólar" : "");

  const [vals, setVals] = useState<IncreaseFormValues>({
    date: initialValues?.date ?? "",
    amount: initialValues?.amount ?? "",
    currency: (initialValues?.currency as PaymentCurrency) ?? "",
    adjustment: (initialValues as any)?.adjustment ?? "",
    note: initialValues?.note ?? "",
  });

  useEffect(() => {
    onChange(vals);
  }, [vals, onChange]);

  const handle = (field: keyof IncreaseFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: any = e.target.value;
    if (field === "amount" || field === "adjustment") {
      value = value === "" ? "" : Number(value);
    } else if (field === "currency") {
      value = value as PaymentCurrency;
    }
    setVals((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box component="form" noValidate>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            type="date"
            fullWidth
            label="Fecha desde que regirá"
            InputLabelProps={{ shrink: true }}
            value={vals.date}
            onChange={handle("date")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField type="number" fullWidth label="Nuevo monto" value={vals.amount} onChange={handle("amount")} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            type="number"
            fullWidth
            label="Porcentaje de ajuste"
            value={vals.adjustment ?? ""}
            onChange={handle("adjustment")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select fullWidth label="Moneda" value={vals.currency} onChange={handle("currency")}>
            {currencies.map((c) => (
              <MenuItem key={c} value={c}>
                {currencyLabel(c)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Nota (opcional)" value={vals.note} onChange={handle("note")} />
        </Grid>
      </Grid>
    </Box>
  );
};
