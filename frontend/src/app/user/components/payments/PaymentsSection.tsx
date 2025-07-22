// src/app/user/components/payments/PaymentsSection.tsx
import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    CircularProgress,
    TextField,
    MenuItem,
} from "@mui/material";
import dayjs from "dayjs";

import { getAllContracts } from "../../../user/services/contract.service";
import type { Contract } from "../../../user/types/contract";

import {
    getPaymentsByContractId,
    postPayment,
    putPayment,
    deletePayment,
} from "../../../user/services/payment.service";
import type { Payment } from "../../../user/types/payment";
import { PaymentCurrency } from "../../../user/types/payment";

import { PaymentsList } from "./PaymentsList";
import { Modal } from "../../../shared/components/Modal";
import {
    PaymentForm,
    PaymentFormValues,
} from "../payments/PaymentForm";

export const PaymentsSection: React.FC = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const currencies = Object.values(PaymentCurrency) as PaymentCurrency[];
    const defaultCurrency = currencies[0];

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contractId, setContractId] = useState<number | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Payment | null>(null);
    const [formVals, setFormVals] = useState<PaymentFormValues>({
        date: today,
        amount: 0,
        description: "",
        paymentCurrency: defaultCurrency,  // ← usa el enum, no string
    });
    const [saving, setSaving] = useState(false);

    // Carga contratos
    useEffect(() => {
        (async () => {
            const c = await getAllContracts();
            setContracts(c);
            setLoading(false);
        })();
    }, []);

    // Carga pagos cuando cambie el contrato
    useEffect(() => {
        if (contractId !== null) {
            (async () => {
                const p = await getPaymentsByContractId(contractId);
                setPayments(p);
            })();
        } else {
            setPayments([]);
        }
    }, [contractId]);

    const handleNew = () => {
        setSelected(null);
        setFormVals({
            date: today,
            amount: 0,
            description: "",
            paymentCurrency: defaultCurrency,
        });
        setOpen(true);
    };

    const handleEdit = (p: Payment) => {
        setSelected(p);
        setFormVals({
            date: p.date.split("T")[0],
            amount: p.amount,
            description: p.description,
            paymentCurrency: p.paymentCurrency,
        });
        setOpen(true);
    };

    const handleDelete = async (p: Payment) => {
        await deletePayment(p);
        setPayments((prev) => prev.filter(x => x.id !== p.id));
    };

    const handleSave = async () => {
        if (contractId === null) return;
        setSaving(true);

        const payload = {
            paymentCurrency: formVals.paymentCurrency,
            amount: formVals.amount,
            date: `${formVals.date}T00:00:00`,
            description: formVals.description,
            contractId,                       // ← ID plano
        };

        console.log("POST /users/payments/create →", payload);   // ⭐️ AQUI

        try {
            if (selected) {
                await putPayment({ ...selected, ...payload });
            } else {
                await postPayment(payload as any);
            }
            const refreshed = await getPaymentsByContractId(contractId);
            setPayments(refreshed);
            setOpen(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box p={2} sx={{ overflow: "auto" }}>
            {/* Selector de contrato + Nuevo Pago */}
            <Box mb={2} display="flex" alignItems="center" gap={2}>
                <TextField
                    select
                    label="Contrato"
                    value={contractId ?? ""}
                    onChange={(e) => setContractId(Number(e.target.value))}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">—</MenuItem>
                    {contracts.map((c) => (
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
                    Registrar Pago
                </Button>
            </Box>

            {/* Lista o loader */}
            {loading ? (
                <CircularProgress />
            ) : (
                <PaymentsList
                    payments={payments}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Modal de formulario */}
            <Modal
                open={open}
                title={selected ? "Editar Pago" : "Registrar Pago"}
                onClose={() => setOpen(false)}
            >
                <PaymentForm
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
