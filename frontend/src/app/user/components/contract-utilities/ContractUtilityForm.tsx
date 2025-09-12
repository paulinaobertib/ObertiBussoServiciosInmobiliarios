import { forwardRef, useImperativeHandle, useState } from "react";
import { Card, CardContent, Grid, MenuItem, TextField, Typography } from "@mui/material";
import type { Utility } from "../../types/utility";
import { UtilityPeriodicityPayment, type ContractUtilityCreate } from "../../types/contractUtility";

export type ContractUtilityFormHandle = {
  getData: () => ContractUtilityCreate;
};

interface Props {
  utility: Utility;
  contractId: number;
}

export const ContractUtilityForm = forwardRef<ContractUtilityFormHandle, Props>(function ContractUtilityForm(
  { utility, contractId },
  ref
) {
  const [periodicity, setPeriodicity] = useState<UtilityPeriodicityPayment>(UtilityPeriodicityPayment.MENSUAL);
  const [initialAmount, setInitialAmount] = useState<number | "">(0);
  const [lastPaidAmount, setLastPaidAmount] = useState<number | "">("");
  const [lastPaidDate, setLastPaidDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useImperativeHandle(ref, () => ({
    getData: () => ({
      periodicity,
      initialAmount: Number(initialAmount || 0),
      lastPaidAmount: lastPaidAmount === "" ? (null as any) : Number(lastPaidAmount),
      lastPaidDate: lastPaidDate ? lastPaidDate : (null as any),
      notes,
      contractId,
      utilityId: utility.id,
    }),
  }));

  const labelize = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : "");

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {utility.name}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Periodicidad"
              value={periodicity}
              onChange={(e) => setPeriodicity(e.target.value as UtilityPeriodicityPayment)}
            >
              {Object.values(UtilityPeriodicityPayment).map((p) => (
                <MenuItem key={p} value={p}>
                  {labelize(p)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              type="number"
              fullWidth
              size="small"
              label="Monto inicial"
              inputProps={{ min: 0 }}
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              type="number"
              fullWidth
              size="small"
              label="Último monto pagado"
              inputProps={{ min: 0 }}
              value={lastPaidAmount}
              onChange={(e) => setLastPaidAmount(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              type="datetime-local"
              fullWidth
              size="small"
              label="Fecha último pago"
              InputLabelProps={{ shrink: true }}
              value={lastPaidDate}
              onChange={(e) => setLastPaidDate(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Notas"
              multiline
              minRows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

