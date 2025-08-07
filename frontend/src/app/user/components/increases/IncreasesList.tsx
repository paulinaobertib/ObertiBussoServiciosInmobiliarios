import { List, Typography } from '@mui/material';
import type { ContractIncrease } from '../../types/contractIncrease';
import { IncreaseItem } from './IncreaseItem';

interface Props {
  increases: ContractIncrease[];
  onDelete?: (inc: ContractIncrease) => void;
}

export const IncreasesList = ({ increases, onDelete }: Props) => {
  if (increases.length === 0) {
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
          onDelete={onDelete}
        />
      ))}
    </List>
  );
};