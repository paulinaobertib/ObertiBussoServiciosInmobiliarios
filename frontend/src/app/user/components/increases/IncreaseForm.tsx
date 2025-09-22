// ✅ Cambios clave en IncreaseForm.tsx

import React, { useState, useEffect } from "react";
import { Box, TextField, MenuItem, Grid } from "@mui/material";
import type { PaymentCurrency } from "../../types/payment";

export interface IncreaseFormValues {
  date: string;
  amount: number | ""; // seguirá pudiendo estar vacío
  currency: PaymentCurrency | "";
  adjustment?: number | "";
  note?: string;
}

interface Props {
  initialValues?: Partial<IncreaseFormValues>;
  onChange: (vals: IncreaseFormValues) => void;
}

export const IncreaseForm = ({ initialValues, onChange }: Props) => {
  const [vals, setVals] = useState<IncreaseFormValues>({
    date: initialValues?.date ?? new Date().toISOString().slice(0, 10),
    amount: initialValues?.amount ?? "",
    currency: (initialValues?.currency as PaymentCurrency) ?? "",
    adjustment: initialValues?.adjustment ?? "",
    note: initialValues?.note ?? "",
  });

  const currencies = ["ARS", "USD"] as PaymentCurrency[];
  const currencyLabel = (c: PaymentCurrency | "") => (c === "ARS" ? "Peso argentino" : c === "USD" ? "Dólar" : "");

  // 🔸 Normaliza números cuando cambian los inputs
  const handle =
    <K extends keyof IncreaseFormValues>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      const value =
        key === "amount" || key === "adjustment"
          ? raw === ""
            ? ""
            : Number(raw) // <- string -> number (o "")
          : raw;

      setVals((prev) => {
        const next = { ...prev, [key]: value } as IncreaseFormValues;
        onChange(next); // propaga al padre en cada cambio
        return next;
      });
    };

  // 🔸 Enviar un onChange inicial al montar (evita vals indefinidos en el padre)
  useEffect(() => {
    onChange(vals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
