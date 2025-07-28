import { ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ContractIncrease } from '../../types/contractIncrease';

interface Props {
    increase: ContractIncrease;
    onDelete?: (inc: ContractIncrease) => void;
}

export const IncreaseItem = ({ increase, onDelete }: Props) => (
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
            primary={`${increase.date.split('T')[0]} - ${increase.amount} ${increase.currency}`}
        />
    </ListItem>
);
