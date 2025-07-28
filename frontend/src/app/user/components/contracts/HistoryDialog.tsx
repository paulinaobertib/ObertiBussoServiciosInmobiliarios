import { useState } from "react";
import { Box, Tabs, Tab, CircularProgress, Typography } from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { PaymentsList } from "../../components/payments/PaymentsList";
import { IncreasesList } from "../../components/increases/IncreasesList";
import type { Contract } from "../../types/contract";
import { useContractHistory } from "../../hooks/contracts/useContractHistory";

interface Props {
    open: boolean;
    contract: Contract | null;
    onClose: () => void;
}

export const HistoryDialog = ({ open, contract, onClose }: Props) => {
    const [tab, setTab] = useState<0 | 1>(0);
    const { payments, increases: inc, loading } = useContractHistory(contract);

    return (
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
                    <PaymentsList payments={payments} />
                ) : (
                    <Typography align="center">Sin pagos registrados.</Typography>
                )
            ) : inc.length > 0 ? (
                <IncreasesList increases={inc} />
            ) : (
                <Typography align="center">Sin aumentos registrados.</Typography>
            )}
        </Modal>
    );
};
