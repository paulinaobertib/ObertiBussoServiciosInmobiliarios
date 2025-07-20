// src/app/property/components/CategorySection.tsx
import React, { useState } from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SearchBar } from '../../../shared/components/SearchBar';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useCategorySection } from '../../hooks/useCategorySection';
import { Category } from '../../context/PropertiesContext';
import { translate } from '../../utils/translate';
import { ModalItem, Info } from '../ModalItem';
import { getAllOwners, getOwnersByText } from '../../services/owner.service';
import { CategoryList } from './CategoryList';
import { AmenityForm } from '../forms/AmenityForm';
import { OwnerForm } from '../forms/OwnerForm';
import { TypeForm } from '../forms/TypeForm';
import { NeighborhoodForm } from '../forms/NeighborhoodForm';
import { StatusForm } from '../forms/StatusForm';

interface Props {
  category: Category;
}

const formRegistry = {
  amenity: AmenityForm,
  owner: OwnerForm,
  type: TypeForm,
  neighborhood: NeighborhoodForm,
  status: StatusForm,
} as const;

export const CategorySection: React.FC<Props> = ({ category }) => {
  const theme = useTheme();
  const { DialogUI } = useConfirmDialog();
  const { data, loading, toggleSelect, isSelected, searchResults } = useCategorySection(category);
  const [modal, setModal] = useState<Info | null>(null);

  const columnsMap: Record<Category, { label: string; key: string }[]> = {
    owner: [
      { label: 'Nombre Completo', key: 'fullName' },
      { label: 'Email', key: 'email' },
      { label: 'Teléfono', key: 'phone' },
    ],
    neighborhood: [
      { label: 'Nombre', key: 'name' },
      { label: 'Ciudad', key: 'city' },
      { label: 'Tipo de Barrio', key: 'type' },
    ],
    type: [
      { label: 'Nombre', key: 'name' },
      { label: 'Ambientes', key: 'hasRooms' },
      { label: 'Dormitorios', key: 'hasBedrooms' },
      { label: 'Baños', key: 'hasBathrooms' },
      { label: 'Área Cubierta', key: 'hasCoveredArea' },
    ],
    amenity: [
      { label: 'Nombre', key: 'name' },
    ],
  };

  const columns = columnsMap[category] || [];
  const gridColumns = '1.2fr 1.5fr 1fr 75px';

  const handleAdd = () => setModal({
    title: `Crear ${translate(category)}`,
    Component: formRegistry[category],
    componentProps: { action: 'add' as const },
  });

  const handleEdit = (item: any) => setModal({
    title: `Editar ${translate(category)}`,
    Component: formRegistry[category],
    componentProps: { action: 'edit' as const, item },
  });

  const handleDelete = (item: any) => setModal({
    title: `Eliminar ${translate(category)}`,
    Component: formRegistry[category],
    componentProps: { action: 'delete' as const, item },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Top bar */}
      <Box
        sx={{
          px: 2, py: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0,
        }}
      >
        {category === 'owner' && (
          <Box sx={{ mr: 1, width: { xs: '12rem', sm: '20rem' } }}>
            <SearchBar
              fetchAll={getAllOwners}
              fetchByText={getOwnersByText}
              onSearch={searchResults}
              placeholder="Buscar propietario"
              debounceMs={400}
            />
          </Box>
        )}
        <IconButton onClick={handleAdd}><AddIcon /></IconButton>
      </Box>

      {/* Headers (desktop) */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'grid' }, gridTemplateColumns: gridColumns,
          px: 2, py: 1, flexShrink: 0,
        }}
      >
        {columns.map(c => <Typography key={c.key} fontWeight={700}
          noWrap
          sx={{
            display: { xs: 'none', sm: 'block' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}

        >{c.label}</Typography>)}
        <Typography align="right" fontWeight={700}>Acciones</Typography>
      </Box>

      {/* Lista con scroll interno */}
      <CategoryList
        data={data}
        loading={loading}
        columns={columns}
        gridColumns={gridColumns}
        toggleSelect={toggleSelect}
        isSelected={isSelected}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ModalItem info={modal} close={() => setModal(null)} />
      {DialogUI}
    </Box>
  );
};
