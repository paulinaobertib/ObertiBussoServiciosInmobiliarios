import { forwardRef, useImperativeHandle } from "react";
import { Box, TextField, MenuItem, Typography, CircularProgress, Card, CardContent, Grid } from "@mui/material";
import { ContractType, ContractStatus, Contract } from "../../types/contract";
import { useContractForm, ContractFormValues } from "../../hooks/contracts/useContractForm";

export type ContractFormHandle = {
    submit: () => Promise<ContractFormValues | null>;
    reset: () => void;
};

interface Props {
    initialPropertyId: number;
    initialUserId: string;
    initialData?: Contract;
    onValidityChange?: (valid: boolean) => void;
}

export const ContractForm = forwardRef<ContractFormHandle, Props>(function ContractForm(
    { initialPropertyId, initialUserId, initialData, onValidityChange }, ref
) {
    const {
        values, property, user, loadingData, handleChange, reset, submit,

    } = useContractForm(initialPropertyId, initialUserId, initialData, onValidityChange);

    useImperativeHandle(ref, () => ({ submit, reset }));

    if (loadingData) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box component="form" noValidate>
            {/* ─── Resumen de selección ─── */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="body1" fontWeight={700} gutterBottom>
                                Propiedad seleccionada
                            </Typography>
                            <Typography>{property?.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Precio: ${property?.price}
                                {property?.expenses! > 0 && ` - Expensas: $${property?.expenses}`}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="body1" fontWeight={700} gutterBottom>
                                Usuario seleccionado
                            </Typography>
                            <Typography>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email} - {user?.phone}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ─── Campos editables ─── */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        select
                        fullWidth
                        label="Tipo de contrato"
                        variant="outlined"
                        value={values.contractType}
                        onChange={handleChange("contractType")}
                    >
                        {Object.values(ContractType).map((t) => (
                            <MenuItem key={t} value={t}>
                                {t}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        select
                        fullWidth
                        label="Estado"
                        variant="outlined"
                        value={values.contractStatus}
                        onChange={handleChange("contractStatus")}
                    >
                        {Object.values(ContractStatus).map((s) => (
                            <MenuItem key={s} value={s}>
                                {s}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        type="date"
                        fullWidth
                        label="Fecha inicio"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        value={values.startDate}
                        onChange={handleChange("startDate")}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        type="date"
                        fullWidth
                        label="Fecha fin"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        value={values.endDate}
                        onChange={handleChange("endDate")}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        type="number"
                        fullWidth
                        label="% Aumento"
                        variant="outlined"
                        value={values.increase}
                        onChange={handleChange("increase")}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        type="number"
                        fullWidth
                        label="Frecuencia aumento (meses)"
                        variant="outlined"
                        value={values.increaseFrequency}
                        onChange={handleChange("increaseFrequency")}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        type="number"
                        fullWidth
                        label="Monto"
                        variant="outlined"
                        value={values.amount}
                        onChange={handleChange("amount")}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        select
                        fullWidth
                        label="Moneda"
                        variant="outlined"
                        value={values.currency}
                        onChange={handleChange("currency")}
                    >
                        {["ARS", "USD"].map((c) => (
                            <MenuItem key={c} value={c}>
                                {c}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>
        </Box>
    );
});
