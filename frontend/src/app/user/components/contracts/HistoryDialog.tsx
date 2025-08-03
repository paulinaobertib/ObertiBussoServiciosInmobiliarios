import { useState } from "react";
import {
    Box,
    Tabs,
    Tab,
    CircularProgress,
    Typography,
} from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { PaymentsList } from "../../components/payments/PaymentsList";
import { IncreasesList } from "../../components/increases/IncreasesList";
import type { Contract } from "../../types/contract";
import { useContractHistory } from "../../hooks/contracts/useContractHistory";
import { putPayment, deletePayment } from "../../services/payment.service";
import { deleteContractIncrease } from "../../services/contractIncrease.service";
import { Payment } from "../../types/payment";
import { ContractIncrease } from "../../types/contractIncrease";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { useConfirmDialog } from "../../../shared/components/ConfirmDialog";

interface Props {
    open: boolean;
    contract: Contract | null;
    onClose: () => void;
}

export const HistoryDialog = ({ open, contract, onClose }: Props) => {
    const [tab, setTab] = useState<0 | 1>(0);
    const [refreshFlag, setRefreshFlag] = useState(0);
    const { payments, increases: inc, loading } = useContractHistory(contract, refreshFlag);
    const { showAlert } = useGlobalAlert();
    const { ask, DialogUI } = useConfirmDialog();

    // PUT pago
    const handleEditPayment = async (payment: Payment) => {
        try {
            if (!contract?.id || !payment.id) {
                alert("El pago o el contrato no tienen un ID válido");
                return;
            }

            const updatedPayment = {
                id: payment.id,
                paymentCurrency: payment.paymentCurrency,
                amount: payment.amount,
                date: payment.date,
                description: payment.description,
                contract: { id: contract.id },
            };

            await putPayment(updatedPayment);
            setRefreshFlag(f => f + 1);
            showAlert("Pago actualizado con éxito", "success");
        } catch (e) {
            console.error("Error editando el pago", e);
            showAlert("Error editando el pago", "error");
        }
    };

    // DELETE pago con confirmación
    const handleDeletePayment = async (payment: Payment) => {
        ask("¿Eliminar este pago?", async () => {
            try {
                await deletePayment(payment);
                setRefreshFlag(f => f + 1);
                showAlert("Pago eliminado con éxito", "success");
            } catch (e) {
                showAlert("Error eliminando el pago", "error");
            }
        });
    };

    // DELETE aumento con confirmación
    const handleDeleteIncrease = async (increase: ContractIncrease) => {
        ask("¿Eliminar este aumento?", async () => {
            try {
                await deleteContractIncrease(increase);
                setRefreshFlag(f => f + 1);
                showAlert("Aumento eliminado con éxito", "success");
            } catch (e) {
                alert("Error eliminando el aumento");
            }
        });
    };

    return (
        <>
            <Modal
                open={open}
                title={contract ? `Historial Contrato #${contract.id}` : ""}
                onClose={onClose}
            >
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                    <Tab label={`Pagos (${payments.length})`} />
                    <Tab label={`Aumentos (${inc.length})`} />
                </Tabs>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : tab === 0 ? (
                    payments.length > 0 ? (
                        <PaymentsList
                            payments={payments}
                            onEdit={handleEditPayment}
                            onDelete={handleDeletePayment}
                        />
                    ) : (
                        <Typography align="center">Sin pagos registrados.</Typography>
                    )
                ) : inc.length > 0 ? (
                    <IncreasesList
                        increases={inc}
                        onDelete={handleDeleteIncrease}
                    />
                ) : (
                    <Typography align="center">Sin aumentos registrados.</Typography>
                )}
            </Modal>
            {DialogUI}
        </>
    );
};
