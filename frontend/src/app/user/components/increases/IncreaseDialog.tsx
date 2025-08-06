import { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { IncreaseForm, IncreaseFormValues } from "../increases/IncreaseForm";
import { postContractIncrease } from "../../services/contractIncrease.service";
import type { Contract } from "../../types/contract";
import { ContractIncreaseCurrency } from "../../../user/types/contractIncrease";
import { useGlobalAlert } from "../../../shared/context/AlertContext";

interface Props {
    open: boolean;
    contract: Contract | null;
    onClose: () => void;
    onSaved: () => void;
}

export const IncreaseDialog = ({ open, contract, onClose, onSaved }: Props) => {
    const { showAlert } = useGlobalAlert();

    const empty: IncreaseFormValues = {
        date: "",
        amount: 0,
        currency: ContractIncreaseCurrency.ARS,
        frequency: 12,
    };

    const [vals, setVals] = useState<IncreaseFormValues>(empty);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setVals(empty);
    }, [contract]);

    const handleSave = async () => {
        if (!contract) return;
        setSaving(true);

        const payload = {
            ...vals,
            date: `${vals.date}T00:00:00`,
            contractId: contract.id,
        };

        try {
            await postContractIncrease(payload);
            showAlert("Aumento creado con éxito", "success");
            onSaved();
        } catch (error) {
            showAlert("Error al crear el aumento", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} title="Nuevo Aumento" onClose={onClose}>
            <IncreaseForm initialValues={vals} onChange={setVals} />
            <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                <Button onClick={onClose} disabled={saving}>Cancelar</Button>
                <Button variant="contained" disabled={saving} onClick={handleSave}>
                    {saving ? "Guardando…" : "Guardar"}
                </Button>
            </Box>
        </Modal>
    );
};
