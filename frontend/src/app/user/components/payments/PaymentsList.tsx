import { List, Typography } from '@mui/material';
import type { Payment } from '../../types/payment';
import { PaymentItem } from './PaymentItem';

interface Props {
    payments: Payment[];
    onEdit?: (p: Payment) => void;
    onDelete?: (p: Payment) => void;
}

export const PaymentsList = ({ payments, onEdit, onDelete }: Props) => {
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
