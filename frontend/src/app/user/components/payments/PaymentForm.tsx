// src/app/user/components/payments/PaymentForm.tsx
import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    MenuItem,
    Grid
} from "@mui/material";
import dayjs from "dayjs";

import { PaymentCurrency } from "../../../user/types/payment";  // :contentReference[oaicite:0]{index=0}

export interface PaymentFormValues {
    date: string;
    amount: number;
    description: string;
    paymentCurrency: PaymentCurrency;
}

interface PaymentFormProps {
    initialValues?: Partial<PaymentFormValues>;
    onChange: (vals: PaymentFormValues) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
    initialValues,
    onChange,
}) => {
    const currencies = Object.values(PaymentCurrency) as PaymentCurrency[];
    const defaultCurrency = currencies[0];
    const today = dayjs().format("YYYY-MM-DD");

    const [vals, setVals] = useState<PaymentFormValues>({
        date: initialValues?.date ?? today,
        amount: initialValues?.amount ?? 0,
        description: initialValues?.description ?? "",
        paymentCurrency: initialValues?.paymentCurrency ?? defaultCurrency,
    });

    useEffect(() => {
        onChange(vals);
    }, [vals, onChange]);

    const handle = (field: keyof PaymentFormValues) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        let value: string | number = e.target.value;
        if (field === "amount") {
            value = Number(value);
        } else if (field === "paymentCurrency") {
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
                        label="Fecha"
                        InputLabelProps={{ shrink: true }}
                        value={vals.date}
                        onChange={handle("date")}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        type="number"
                        fullWidth
                        label="Monto"
                        value={vals.amount}
                        onChange={handle("amount")}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Descripción"
                        value={vals.description}
                        onChange={handle("description")}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        select
                        fullWidth
                        label="Moneda"
                        value={vals.paymentCurrency}
                        onChange={handle("paymentCurrency")}
                    >
                        {currencies.map((c) => (
                            <MenuItem key={c} value={c}>
                                {c}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>
        </Box>
    );
};
