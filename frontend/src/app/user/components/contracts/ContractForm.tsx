import { forwardRef, useImperativeHandle } from "react";
import {
    Box, Grid, Card, CardContent, Typography,
    TextField, MenuItem, CircularProgress, Divider,
} from "@mui/material";
import { ContractType, Contract } from "../../types/contract";
import { useContractForm, ContractFormValues } from "../../hooks/contracts/useContractForm";

export type ContractFormHandle = {
    submit: () => Promise<ContractFormValues | null>;
    reset: () => void;
};

interface Props {
    initialPropertyId: number;
    initialUserId: string;
    initialData?: Contract;
    onValidityChange?: (v: boolean) => void;
}

export const ContractForm = forwardRef<ContractFormHandle, Props>(function ContractForm(
    { initialPropertyId, initialUserId, initialData, onValidityChange }, ref
) {
    const {
        values, property, user, loadingData,
        handleChange, reset, submit,
    } = useContractForm(initialPropertyId, initialUserId, initialData, onValidityChange);

    useImperativeHandle(ref, () => ({ submit, reset }));

    if (loadingData)
        return <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}><CircularProgress /></Box>;

    return (
        <Box component="form" noValidate>

            {/* ─── Resumen selección ─── */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined"><CardContent>
                        <Typography fontWeight={700}>Propiedad</Typography>
                        <Typography>{property?.title}</Typography>
                    </CardContent></Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined"><CardContent>
                        <Typography fontWeight={700}>Usuario</Typography>
                        <Typography>{user?.firstName} {user?.lastName}</Typography>
                    </CardContent></Card>
                </Grid>
            </Grid>

            {/* ─── Datos del contrato ─── */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Datos del contrato
            </Typography>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField select fullWidth required label="Tipo" size="small"
                        value={values.contractType || ""}
                        onChange={handleChange("contractType")}>
                        {Object.values(ContractType).map(t => (
                            <MenuItem key={t} value={t}>
                                {t.charAt(0) + t.slice(1).toLowerCase()}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField select fullWidth required label="Estado" size="small"
                        value={values.contractStatus || ""}
                        onChange={handleChange("contractStatus")}>
                        <MenuItem value="ACTIVO">Activo</MenuItem>
                        <MenuItem value="INACTIVO">Inactivo</MenuItem>
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField type="date" fullWidth required label="Inicio" size="small"
                        InputLabelProps={{ shrink: true }} value={values.startDate}
                        onChange={handleChange("startDate")} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField type="date" fullWidth required label="Fin" size="small"
                        InputLabelProps={{ shrink: true }} value={values.endDate}
                        onChange={handleChange("endDate")} />
                </Grid>
            </Grid>

            {/* Divider */}
            <Divider sx={{ my: 2 }} />

            {/* ─── Datos de pagos ─── */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Datos de pagos
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField type="number" fullWidth required label="Monto inicial" size="small"
                        inputProps={{ min: 0 }} value={values.amount === 0 ? "" : values.amount}
                        onChange={handleChange("amount")} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField select fullWidth required label="Moneda" size="small"
                        value={values.currency || ""}
                        onChange={handleChange("currency")}>
                        <MenuItem value="ARS">Peso Argentino</MenuItem>
                        <MenuItem value="USD">Dólar</MenuItem>
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField type="number" required fullWidth label="Porcentaje de aumento" size="small"
                        inputProps={{ min: 0 }} value={values.increase}
                        onChange={handleChange("increase")} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField type="number" required fullWidth label="Frecuencia de aumento (meses)" size="small"
                        inputProps={{ min: 0 }} value={values.increaseFrequency}
                        onChange={handleChange("increaseFrequency")} />
                </Grid>
            </Grid>
        </Box>
    );
});
