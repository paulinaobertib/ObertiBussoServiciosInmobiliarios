// src/app/property/components/CategoryList.tsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { CategoryItem } from './CategoryItem';

interface ColumnDef { label: string; key: string }
interface CategoryListProps {
  data: any[];
  loading: boolean;
  columns: ColumnDef[];
  gridColumns: string;
  toggleSelect: (id: number) => void;
  isSelected: (id: number) => boolean;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  data,
  loading,
  columns,
  gridColumns,
  toggleSelect,
  isSelected,
  onEdit,
  onDelete,
}) => (
  <Box sx={{ px: 2, flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={28} />
      </Box>
    ) : data.length > 0 ? (
      data.map(item => (
        <CategoryItem
          key={item.id}
          item={item}
          columns={columns}
          gridColumns={gridColumns}
          toggleSelect={toggleSelect}
          isSelected={isSelected}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))
    ) : (
      <Typography sx={{ mt: 2 }}>No hay datos disponibles.</Typography>
    )}
  </Box>
);