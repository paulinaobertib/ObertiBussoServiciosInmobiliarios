// src/app/user/components/increases/IncreasesTab.tsx
import React from 'react';
import { List, Typography } from '@mui/material';
import type { ContractIncrease } from '../../types/contractIncrease';
import { IncreaseItem } from './IncreaseItem';

interface IncreasesTabProps {
  increases: ContractIncrease[];
  onDelete?: (inc: ContractIncrease) => void;
}

export const IncreasesList: React.FC<IncreasesTabProps> = ({
  increases,
  onDelete
}) => {
  if (increases.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sin aumentos registrados
      </Typography>
    );
  }

  return (
    <List dense>
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
