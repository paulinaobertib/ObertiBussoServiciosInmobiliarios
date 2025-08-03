import { useState } from 'react';
import {
    ListItem,
    ListItemText,
    IconButton,
    Tooltip,
    Box,
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

import type { Payment } from '../../../user/types/payment';
import { useAuthContext } from '../../context/AuthContext';

interface Props {
    payment: Payment;
    onEdit?: (p: Payment) => void;      // PUT
    onDelete?: (p: Payment) => void;    // DELETE
}

export const PaymentItem = ({ payment, onEdit, onDelete }: Props) => {
    const [editMode, setEditMode] = useState(false);
    const [description, setDesc] = useState(payment.description);
    const [amount, setAmount] = useState(payment.amount);
    const [paymentCurrency, setPaymentCurrency] = useState(payment.paymentCurrency);
    const [date, setDate] = useState(payment.date);
    const { isAdmin } = useAuthContext();
    const theme = useTheme();

    const handleSave = () => {
        const hasChanges =
            amount !== payment.amount ||
            description !== payment.description ||
            date !== payment.date ||
            paymentCurrency !== payment.paymentCurrency;

        if (onEdit && hasChanges) {
            onEdit({
                ...payment,
                amount,
                paymentCurrency,
                date,
                description
            });
        }

        setEditMode(false);
    };

    return (
        <ListItem
            alignItems="flex-start"
            sx={{
                position: 'relative',
                backgroundColor: editMode ? theme.palette.quaternary.main : undefined,
                borderRadius: 1,
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1,
                }}
            >
                {onEdit && isAdmin && (
                    editMode ? (
                        <Tooltip title="Guardar cambios">
                            <IconButton size="small" onClick={handleSave}>
                                <SaveIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Editar pago">
                            <IconButton size="small" onClick={() => setEditMode(true)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    )
                )}
                {onDelete && isAdmin && (
                    <Tooltip title="Eliminar pago">
                        <IconButton size="small" onClick={() => onDelete(payment)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            <ListItemText
                primary={`${payment.date.split('T')[0]} - $${payment.amount} ${payment.paymentCurrency}`}
                secondary={
                    editMode ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="Descripción"
                                value={description}
                                onChange={e => setDesc(e.target.value)}
                                size="small"
                                variant="standard"
                                autoFocus
                            />
                            <TextField
                                label="Monto"
                                type="number"
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                size="small"
                                variant="standard"
                            />
                            <FormControl variant="standard" size="small">
                                <InputLabel>Moneda</InputLabel>
                                <Select
                                    value={paymentCurrency}
                                    onChange={e => setPaymentCurrency(e.target.value)}
                                >
                                    <MenuItem value="ARS">ARS</MenuItem>
                                    <MenuItem value="USD">USD</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Fecha"
                                type="date"
                                value={date.split('T')[0]}
                                onChange={e => setDate(e.target.value)}
                                size="small"
                                variant="standard"
                            />
                        </Box>
                    ) : (
                        `Descripción: ${payment.description}`
                    )
                }
            />
        </ListItem>
    );
};
