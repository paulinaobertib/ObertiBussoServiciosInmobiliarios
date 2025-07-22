// src/app/user/components/increases/IncreasesPanel.tsx
import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    CircularProgress,
    TextField,
    MenuItem,
} from "@mui/material";
import dayjs from "dayjs";

import { getAllContracts } from "../../services/contract.service";
import type { Contract } from "../../types/contract";

import {
    getContractIncreasesByContract,
    postContractIncrease,
    deleteContractIncrease,
} from "../../services/contractIncrease.service";
import type { ContractIncrease } from "../../types/contractIncrease";

import { IncreasesList } from "./IncreasesList";
import { Modal } from "../../../shared/components/Modal";
import {
    IncreaseForm,
    IncreaseFormValues,
} from "./IncreaseForm";

import { ContractIncreaseCurrency } from "../../types/contractIncrease";

export const IncreasesPanel: React.FC = () => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contractId, setContractId] = useState<number | null>(null);
    const [increases, setIncreases] = useState<ContractIncrease[]>([]);
    const [loading, setLoading] = useState(true);

    const currencies = Object.values(ContractIncreaseCurrency) as ContractIncreaseCurrency[];
    const defaultCurrency = currencies[0];
    const today = dayjs().format("YYYY-MM-DD");

    const [open, setOpen] = useState(false);
    const [formVals, setFormVals] = useState<IncreaseFormValues>({
        date: today,
        amount: 0,
        currency: defaultCurrency,
        frequency: 12,
    });
    const [saving, setSaving] = useState(false);

    // Load contracts on mount
    useEffect(() => {
        (async () => {
            const c = await getAllContracts();
            setContracts(c);
            setLoading(false);
        })();
    }, []);

    // Load increases when a contract is selected
    useEffect(() => {
        if (contractId !== null) {
            (async () => {
                const ins = await getContractIncreasesByContract(contractId);
                setIncreases(ins);
            })();
        } else {
            setIncreases([]);
        }
    }, [contractId]);

    const handleNew = () => {
        // Reset form values when opening
        setFormVals({
            date: today,
            amount: 0,
            currency: defaultCurrency,
            frequency: 12,
        });
        setOpen(true);
    };

    const handleDelete = async (inc: ContractIncrease) => {
        await deleteContractIncrease(inc);
        setIncreases(prev => prev.filter(i => i.id !== inc.id));
    };

    const handleSave = async () => {
        if (contractId === null) return;
        setSaving(true);

        const payload = {
            ...formVals,
            date: `${formVals.date}T00:00:00`,
            contractId,
        };
        console.log("📤 POST /increases payload:", payload);
        await postContractIncrease(payload);

        const updated = await getContractIncreasesByContract(contractId);
        setIncreases(updated);
        setOpen(false);
        setSaving(false);
    };

    return (
        <Box p={2} sx={{ overflow: "auto" }}>
            {/* Selector de contrato y botón */}
            <Box mb={2} display="flex" alignItems="center" gap={2}>
                <TextField
                    select
                    label="Contrato"
                    value={contractId ?? ""}
                    onChange={e => setContractId(Number(e.target.value))}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">—</MenuItem>
                    {contracts.map(c => (
                        <MenuItem key={c.id} value={c.id}>
                            #{c.id} — {c.contractType}
                        </MenuItem>
                    ))}
                </TextField>

                <Button
                    variant="contained"
                    disabled={contractId === null}
                    onClick={handleNew}
                >
                    Nuevo Aumento
                </Button>
            </Box>

            {/* Lista o loader */}
            {loading ? (
                <CircularProgress />
            ) : (
                <IncreasesList increases={increases} onDelete={handleDelete} />
            )}

            {/* Modal para crear aumento */}
            <Modal
                open={open}
                title="Nuevo Aumento"
                onClose={() => setOpen(false)}
            >
                <IncreaseForm
                    initialValues={formVals}
                    onChange={setFormVals}
                />

                <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Guardando…" : "Guardar"}
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
};
