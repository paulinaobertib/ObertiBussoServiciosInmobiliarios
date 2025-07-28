import { ListItem, ListItemText, IconButton, Tooltip, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import type { Payment } from '../../../user/types/payment';

interface Props {
    payment: Payment;
    onEdit?: (p: Payment) => void;
    onDelete?: (p: Payment) => void;
}

export const PaymentItem = ({ payment, onEdit, onDelete }: Props) => (
    <ListItem
        secondaryAction={
            <Box sx={{ display: 'flex', gap: 1 }}>
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
            </Box>
        }
    >
        <ListItemText
            primary={`${payment.date.split('T')[0]} - $${payment.amount} ${payment.paymentCurrency}`}
            secondary={`Descripción: ${payment.description}`}
        />
    </ListItem>
);
