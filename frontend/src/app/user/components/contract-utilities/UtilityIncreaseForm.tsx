import React, { useEffect, useState } from "react";
import { Box, Grid, TextField } from "@mui/material";

export interface UtilityIncreaseFormValues {
  adjustmentDate: string;
  amount: number | "";
}

interface Props {
  initialValues?: Partial<UtilityIncreaseFormValues>;
  onChange: (vals: UtilityIncreaseFormValues) => void;
}

export function UtilityIncreaseForm({ initialValues, onChange }: Props) {
  const [vals, setVals] = useState<UtilityIncreaseFormValues>({
    adjustmentDate: initialValues?.adjustmentDate ?? "",
    amount: initialValues?.amount ?? "",
  });

  useEffect(() => {
    onChange(vals);
  }, [vals, onChange]);

  const handle = (field: keyof UtilityIncreaseFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: any = e.target.value;
    if (field === "amount") value = value === "" ? "" : Number(value);
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
            value={vals.adjustmentDate}
            onChange={handle("adjustmentDate")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            type="number"
            fullWidth
            label="Nuevo monto"
            value={vals.amount}
            onChange={handle("amount")}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

