import { useCallback } from 'react';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GridSection } from '../../../shared/components/GridSection';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useGlobalAlert } from '../../../shared/context/AlertContext';
import { usePropertyPanel } from '../../hooks/usePropertySection';
import { getAllProperties, getPropertiesByText, deleteProperty } from '../../services/property.service';
import { getRowActions } from '../ActionsRowItems';
import type { Property } from '../../types/property';

interface Props {
  toggleSelect?: (id: number) => void;
  isSelected?: (id: number) => boolean;
  showActions?: boolean;
  filterAvailable?: boolean;
  selectable?: boolean,
}

export const PropertySection = ({
  toggleSelect: externalToggle,
  isSelected: externalIsSelected,
  showActions = true,
  filterAvailable = false,
  selectable = true,
}: Props) => {
  const navigate = useNavigate();
  const { ask, DialogUI } = useConfirmDialog();
  const { showAlert } = useGlobalAlert();

  const {
    data: properties = [],
    loading,
    onSearch,
    toggleSelect: internalToggle,
    isSelected: internalIsSelected,
  } = usePropertyPanel();

  // ——— Hooks y callbacks siempre al inicio —————————————————

  const gridToggleSelect = useCallback(
    (selected: string | string[] | null) => {
      const raw = Array.isArray(selected)
        ? selected[selected.length - 1]
        : selected;
      const num = raw != null ? Number(raw) : null;
      if (num !== null) (externalToggle ?? internalToggle)(num);
    },
    [externalToggle, internalToggle]
  );

  const gridIsSelected = useCallback(
    (id: string) => {
      const num = Number(id);
      return (externalIsSelected ?? internalIsSelected)(num);
    },
    [externalIsSelected, internalIsSelected]
  );

  const fetchAll = useCallback(async () => {
    const res = await getAllProperties();
    onSearch(res);
    return res;
  }, [onSearch]);

  const fetchByText = useCallback(async (term: string) => {
    const list = await getPropertiesByText(term);
    onSearch(list);
    return list;
  }, [onSearch]);

  // —————————————————————————————————————————————————————————————

  if (loading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
        }}
      >
        <CircularProgress size={36} />
      </Box>
    );
  }

  // Filtrado opcional de “disponibles”
  const rows = filterAvailable
    ? properties.filter(
      (p) => !p.status || p.status.toLowerCase() === 'disponible'
    )
    : properties;

  // Columnas del grid
  const columns = [
    { field: 'title', headerName: 'Título', flex: 1 },
    { field: 'operation', headerName: 'Operación', flex: 1 },
    {
      field: 'price',
      headerName: 'Precio',
      flex: 1,
      renderCell: (params: any) => {
        const row: Partial<Property> = params.row ?? {};
        return (
          <Typography>
            {row.currency ?? ''} {row.price != null ? row.price : '—'}
          </Typography>
        );
      },
    },
    ...(showActions
      ? [
        {
          field: 'actions',
          headerName: 'Acciones',
          width: 160,
          sortable: false,
          filterable: false,
          renderCell: (params: any) => {
            const actions = getRowActions(
              'property',
              params.row as Property,
              () => { },
              ask,
              deleteProperty,
              showAlert
            );
            return (
              <Box
                display="flex"
                gap={1}
                height="100%"
                alignItems="center"
                justifyContent="center"
                width="100%"
              >
                {actions.map((a) => (
                  <IconButton
                    key={a.label}
                    size="small"
                    title={a.label}
                    onClick={a.onClick}
                  >
                    {a.icon}
                  </IconButton>
                ))}
              </Box>
            );
          },
        },
      ]
      : []),
  ];

  const openCreate = () => navigate('/properties/new');
  const openEdit = (p: Property) => navigate(`/properties/${p.id}/edit`);

  return (
    <>
      <GridSection
        data={rows}
        loading={loading}
        columns={columns}
        onSearch={onSearch}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={() => { }}
        onRoles={undefined}
        toggleSelect={gridToggleSelect}
        isSelected={gridIsSelected}
        entityName="Propiedad"
        showActions={false}
        fetchAll={fetchAll}
        fetchByText={fetchByText}
        multiSelect={false}
        selectable={selectable}

      />
      {DialogUI}
    </>
  );
};
