import { Box, Typography } from '@mui/material';
import { CategoryItem } from './CategoryItem';

interface Column {
  label: string;
  key: string;
}

export interface Props {
  data: any[];
  columns: Column[];
  gridColumns: string;
  toggleSelect: (id: number) => void;
  isSelected: (id: number) => boolean;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export const CategoryList = ({ data, columns, gridColumns, toggleSelect, isSelected, onEdit, onDelete,
}: Props) => {
  const sortKey = columns[0]?.key ?? '';
  const sortedData = [...data].sort((a, b) =>
    String(a?.[sortKey] ?? '')
      .localeCompare(String(b?.[sortKey] ?? ''), 'es', {
        sensitivity: 'base',
      })
  );

  return (
    <Box sx={{ px: 2, flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
      {sortedData.length > 0 ? (
        sortedData.map((item) => (
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
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          No hay datos disponibles.
        </Typography>
      )}
    </Box>
  );
};
