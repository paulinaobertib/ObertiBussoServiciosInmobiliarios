import { forwardRef, useImperativeHandle, useState } from "react";
import { Box, Grid, MenuItem, TextField } from "@mui/material";
import type { Utility } from "../../types/utility";
import { UtilityPeriodicityPayment, type ContractUtilityCreate } from "../../types/contractUtility";

export type ContractUtilityFormHandle = {
  getData: () => ContractUtilityCreate;
};

interface Props {
  utility: Utility;
  contractId: number;
  initial?: Partial<ContractUtilityCreate & { id?: number }>;
}

export const ContractUtilityForm = forwardRef<ContractUtilityFormHandle, Props>(function ContractUtilityForm(
  { utility, contractId, initial },
  ref
) {
  const [periodicity, setPeriodicity] = useState<UtilityPeriodicityPayment>(
    initial?.periodicity ?? UtilityPeriodicityPayment.MENSUAL
  );
  const [initialAmount, setInitialAmount] = useState<number | "">(initial?.initialAmount ?? 0);
  // Pagos se registran por fuera (no en alta/edición de vínculo)
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");

  useImperativeHandle(ref, () => ({
    getData: () => ({
      periodicity,
      initialAmount: Number(initialAmount || 0),
      lastPaidAmount: null as any,
      lastPaidDate: null as any,
      notes,
      contractId,
      utilityId: utility.id,
    }),
  }));

  const labelize = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : "");

  return (
    <Box>
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
    </Box>
  );
});
