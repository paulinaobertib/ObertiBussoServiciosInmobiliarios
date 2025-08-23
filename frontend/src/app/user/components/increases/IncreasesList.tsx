import { List, Typography } from '@mui/material';
import type { ContractIncrease } from '../../types/contractIncrease';
import { IncreaseItem } from './IncreaseItem';

interface Props {
  increases: ContractIncrease[];
  onEdit?: (inc: ContractIncrease) => void | Promise<void>;
  onDelete?: (inc: ContractIncrease) => void | Promise<void>;
}

export const IncreasesList = ({ increases, onEdit, onDelete }: Props) => {
  if (!increases || increases.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sin aumentos registrados
      </Typography>
    );
  }

  return (
    <List>
      {increases.map((inc) => (
        <IncreaseItem
          key={inc.id}
          increase={inc}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </List>
  );
};
