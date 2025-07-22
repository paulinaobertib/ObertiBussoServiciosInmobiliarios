// src/app/user/components/payments/PaymentItem.tsx
import React from 'react';
import {
    ListItem,
    ListItemText,
    IconButton,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from "@mui/icons-material/Edit";

import type { Payment } from '../../../user/types/payment';  // :contentReference[oaicite:0]{index=0}

interface PaymentItemProps {
    payment: Payment;
    onEdit?: (p: Payment) => void;
    onDelete?: (p: Payment) => void;
}

export const PaymentItem: React.FC<PaymentItemProps> = ({
    payment,
    onEdit,
    onDelete
}) => (
    <ListItem
        secondaryAction={
            <React.Fragment>
                {onEdit && (
                    <Tooltip title="Editar pago">
                        <IconButton edge="end" onClick={() => onEdit(payment)}>
                          <EditIcon />
                        </IconButton>
                    </Tooltip>
                )}
                {onDelete && (
                    <Tooltip title="Eliminar pago">
                        <IconButton edge="end" onClick={() => onDelete(payment)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </React.Fragment>
        }
    >
        <ListItemText
            primary={`${payment.date.split('T')[0]} — $${payment.amount} ${payment.paymentCurrency}`}
            secondary={`Descripción: ${payment.description}`}
        />
    </ListItem>
);
