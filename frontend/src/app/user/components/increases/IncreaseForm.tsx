import React, { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Grid } from '@mui/material';
import dayjs from 'dayjs';

import { ContractIncreaseCurrency } from '../../types/contractIncrease';

export interface IncreaseFormValues {
  date: string;
  amount: number;
  currency: ContractIncreaseCurrency;
  frequency: number;
}

interface Props {
  initialValues?: Partial<IncreaseFormValues>;
  onChange: (vals: IncreaseFormValues) => void;
}

export const IncreaseForm = ({ initialValues, onChange }: Props) => {
  const currencies = Object.values(ContractIncreaseCurrency) as ContractIncreaseCurrency[];
  const defaultCurrency = currencies[0];

  const [vals, setVals] = useState<IncreaseFormValues>({
    date: initialValues?.date ?? dayjs().format('YYYY-MM-DD'),
    amount: initialValues?.amount ?? 0,
    currency: initialValues?.currency ?? defaultCurrency,
    frequency: initialValues?.frequency ?? 12,
  });

  useEffect(() => {
    onChange(vals);
  }, [vals, onChange]);

  const handle = (field: keyof IncreaseFormValues) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value: string | number = e.target.value;
    if (field === 'amount' || field === 'frequency') {
      value = Number(value);
    } else if (field === 'currency') {
      value = value as ContractIncreaseCurrency;
    }
    setVals(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box component="form" noValidate>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            type="date"
            fullWidth
            label="Fecha"
            InputLabelProps={{ shrink: true }}
            value={vals.date}
            onChange={handle('date')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            type="number"
            fullWidth
            label="Monto"
            value={vals.amount}
            onChange={handle('amount')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Moneda"
            value={vals.currency}
            onChange={handle('currency')}
          >
            {currencies.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            type="number"
            fullWidth
            label="Frecuencia (meses)"
            value={vals.frequency}
            onChange={handle('frequency')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};