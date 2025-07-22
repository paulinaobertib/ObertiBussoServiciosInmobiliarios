// src/app/user/components/increases/forms/IncreaseForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid as Grid2
} from '@mui/material';
import dayjs from 'dayjs';

// Importa tu enum de monedas
import { ContractIncreaseCurrency } from '../../../user/types/contractIncrease';

export interface IncreaseFormValues {
  date: string;
  amount: number;
  currency: ContractIncreaseCurrency;
  frequency: number;
}

interface IncreaseFormProps {
  initialValues?: Partial<IncreaseFormValues>;
  onChange: (vals: IncreaseFormValues) => void;
}

export const IncreaseForm: React.FC<IncreaseFormProps> = ({
  initialValues,
  onChange
}) => {
  // Sacamos dinámicamente el primer valor válido del enum
  const currencies = Object.values(ContractIncreaseCurrency) as ContractIncreaseCurrency[];
  const defaultCurrency = currencies[0];

  const [vals, setVals] = useState<IncreaseFormValues>({
    date:      initialValues?.date      ?? dayjs().format('YYYY-MM-DD'),
    amount:    initialValues?.amount    ?? 0,
    currency:  initialValues?.currency  ?? defaultCurrency,
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
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            type="date"
            fullWidth
            label="Fecha"
            InputLabelProps={{ shrink: true }}
            value={vals.date}
            onChange={handle('date')}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            type="number"
            fullWidth
            label="Monto"
            value={vals.amount}
            onChange={handle('amount')}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
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
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            type="number"
            fullWidth
            label="Frecuencia (meses)"
            value={vals.frequency}
            onChange={handle('frequency')}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
};
