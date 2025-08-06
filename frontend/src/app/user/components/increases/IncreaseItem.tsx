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
    Select,
    MenuItem,
    useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

import type { ContractIncrease } from '../../types/contractIncrease';
import { useAuthContext } from '../../context/AuthContext';

interface Props {
    increase: ContractIncrease;
    onDelete?: (inc: ContractIncrease) => void;
    onEdit?: (inc: ContractIncrease) => void;
}

export const IncreaseItem = ({ increase, onDelete, onEdit }: Props) => {
    const { isAdmin } = useAuthContext();
    const [editMode, setEditMode] = useState(false);
    const [amount, setAmount] = useState(increase.amount);
    const [currency, setCurrency] = useState(increase.currency);
    const [date, setDate] = useState(increase.date);
    const theme = useTheme();

    const handleSave = () => {
        const hasChanges =
            amount !== increase.amount ||
            currency !== increase.currency ||
            date !== increase.date;

        if (onEdit && hasChanges) {
            onEdit({
                ...increase,
                amount,
                currency,
                date,
            });
        }

        setEditMode(false);
    };

    return (
        <ListItem
            sx={{
                position: 'relative',
                backgroundColor: editMode ? theme.palette.quaternary.main : undefined,
                borderRadius: 1,
            }}
            alignItems="flex-start"
        >
            {isAdmin && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 1,
                    }}
                >
                    {editMode ? (
                        <Tooltip title="Guardar cambios">
                            <IconButton size="small" onClick={handleSave}>
                                <SaveIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Editar aumento">
                            <IconButton
                                size="small"
                                onClick={() => setEditMode(true)}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    {onDelete && (
                        <Tooltip title="Eliminar aumento">
                            <IconButton size="small" onClick={() => onDelete(increase)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )}

            <ListItemText
                primary={
                    `${(editMode ? date : increase.date).split('T')[0]} - ${editMode ? amount : increase.amount} ${editMode ? currency : increase.currency}`
                }
                secondary={
                    editMode ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value)}
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
                    ) : null
                }
            />
        </ListItem>
    );
};