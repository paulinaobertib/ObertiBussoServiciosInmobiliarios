import { useState, useCallback } from 'react';
import { Box, CircularProgress, IconButton } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GridSection } from '../../../shared/components/GridSection';
import { useCategorySection } from '../../hooks/useCategorySection';
import { translate } from '../../utils/translate';
import { ModalItem, Info } from './CategoryModal';
import { AmenityForm } from '../forms/AmenityForm';
import { OwnerForm } from '../forms/OwnerForm';
import { TypeForm } from '../forms/TypeForm';
import { NeighborhoodForm } from '../forms/NeighborhoodForm';
import type { Category } from '../../context/PropertiesContext';

const formRegistry = {
  amenity: AmenityForm,
  owner: OwnerForm,
  type: TypeForm,
  neighborhood: NeighborhoodForm,
} as const;

export const CategorySection = ({ category }: { category: Category }) => {
  const {
    data,
    loading,
    refresh,
    onSearch,
    toggleSelect: internalToggle,
    isSelected: internalIsSelected,
  } = useCategorySection(category);

  // Adaptadores para GridSection
  const gridToggleSelect = useCallback(
    (selected: string | string[] | null) => {
      const raw = Array.isArray(selected)
        ? selected[selected.length - 1]
        : selected;
      const id = raw != null ? Number(raw) : null;
      if (id !== null) internalToggle(id);
    },
    [internalToggle]
  );

  const gridIsSelected = useCallback(
    (id: string) => internalIsSelected(Number(id)),
    [internalIsSelected]
  );

  // Búsqueda local: no hay endpoint remoto, filtramos en memoria
  const fetchAll = useCallback(async () => {
    await refresh();
    onSearch(data);
    return data;
  }, [refresh, onSearch, data]);

  const fetchByText = useCallback(async (term: string) => {
    const lower = term.trim().toLowerCase();
    if (!lower) {
      onSearch(data);
      return data;
    }
    // Definimos campos a buscar según categoría
    const columnsMap: Record<Category, string[]> = {
      owner: ['fullName', 'email', 'phone'],
      amenity: ['name'],
      type: ['name'],
      neighborhood: ['name', 'city', 'type'],
    };
    const keys = columnsMap[category] || [];
    const filtered = data.filter(item =>
      keys.some(key => {
        const value = String((item as any)[key] ?? '').toLowerCase();
        return value.includes(lower);
      })
    );
    onSearch(filtered);
    return filtered;
  }, [category, data, onSearch]);

  // Columnas dinámicas
  const headersMap: Record<Category, { field: string; headerName: string }[]> = {
    owner: [
      { field: 'fullName', headerName: 'Nombre Completo' },
      { field: 'email', headerName: 'Email' },
      { field: 'phone', headerName: 'Teléfono' },
    ],
    amenity: [{ field: 'name', headerName: 'Nombre' }],
    type: [
      { field: 'name', headerName: 'Nombre' },
      { field: 'hasRooms', headerName: 'Ambientes' },
      { field: 'hasBedrooms', headerName: 'Dormitorios' },
      { field: 'hasBathrooms', headerName: 'Baños' },
      { field: 'hasCoveredArea', headerName: 'Área Cubierta' },
    ],
    neighborhood: [
      { field: 'name', headerName: 'Nombre' },
      { field: 'city', headerName: 'Ciudad' },
      { field: 'type', headerName: 'Tipo' },
    ],
  };

  const columns: GridColDef[] = headersMap[category].map(col => {
    const isBooleanField =
      category === 'type' &&
      ['hasRooms', 'hasBedrooms', 'hasBathrooms', 'hasCoveredArea'].includes(col.field);

    return {
      field: col.field,
      headerName: col.headerName,
      flex: 1,
      renderCell: isBooleanField
        ? (params: any) => {
            const value = params.row?.[col.field];
            return typeof value === 'boolean' ? (value ? 'Sí' : 'No') : '-';
          }
        : undefined,
    };
  });

  // Columna de acciones
  columns.push({
    field: 'actions',
    headerName: 'Acciones',
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: params => {
      const item = params.row;
      return (
        <Box>
          <IconButton
            size="small"
            title="Editar"
            onClick={() => handleOpen('edit', item)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            title="Eliminar"
            onClick={() => handleOpen('delete', item)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      );
    },
  });

  // Modal handlers
  const [modal, setModal] = useState<Info | null>(null);
  const handleOpen = (action: 'add' | 'edit' | 'delete', item?: any) => {
    setModal({
      title: `${action === 'add' ? 'Crear' : action === 'edit' ? 'Editar' : 'Eliminar'} ${translate(category)}`,
      Component: formRegistry[category],
      componentProps: { action, item },
    });
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}
      >
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <>
      <GridSection
        data={data}
        loading={loading}
        columns={columns}
        onSearch={onSearch}
        onCreate={() => handleOpen('add')}
        onEdit={item => handleOpen('edit', item)}
        onDelete={item => handleOpen('delete', item)}
        toggleSelect={gridToggleSelect}
        isSelected={gridIsSelected}
        entityName={translate(category)}
        showActions={true}
        fetchAll={fetchAll}
        fetchByText={fetchByText}
        multiSelect={category === 'amenity'}
      />
      <ModalItem info={modal} close={() => setModal(null)} />
    </>
  );
};