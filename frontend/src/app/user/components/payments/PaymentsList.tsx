// src/app/user/components/payments/PaymentsTab.tsx
import React from 'react';
import { List, Typography } from '@mui/material';
import type { Payment } from '../../types/payment';  // :contentReference[oaicite:1]{index=1}
import { PaymentItem } from './PaymentItem';

interface PaymentsTabProps {
    payments: Payment[];
    onEdit?: (p: Payment) => void;
    onDelete?: (p: Payment) => void;
}

export const PaymentsList: React.FC<PaymentsTabProps> = ({
    payments,
    onEdit,
    onDelete
}) => {
    if (payments.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                Sin pagos registrados
            </Typography>
        );
    }

    return (
        <List dense>
            {payments.map((p) => (
                <PaymentItem
                    key={p.id}
                    payment={p}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </List>
    );
};
