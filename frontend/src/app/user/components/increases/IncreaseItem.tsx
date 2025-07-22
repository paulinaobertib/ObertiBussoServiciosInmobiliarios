// src/app/user/components/increases/IncreaseItem.tsx
import React from 'react';
import {
    ListItem,
    ListItemText,
    IconButton,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ContractIncrease } from '../../types/contractIncrease';

interface IncreaseItemProps {
    increase: ContractIncrease;
    onDelete?: (inc: ContractIncrease) => void;
}

export const IncreaseItem: React.FC<IncreaseItemProps> = ({
    increase,
    onDelete
}) => (
    <ListItem
        secondaryAction={
            onDelete && (
                <Tooltip title="Eliminar aumento">
                    <IconButton edge="end" onClick={() => onDelete(increase)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            )
        }
    >
        <ListItemText
            primary={`${increase.date.split('T')[0]} — ${increase.amount} ${increase.currency}`}
        />
    </ListItem>
);
