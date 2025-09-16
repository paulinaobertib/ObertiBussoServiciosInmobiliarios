import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Button } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridRowId,
  GridRowSelectionModel,
  MuiEvent,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { Modal } from './Modal';
import { SearchBar } from './SearchBar';

interface GridSectionProps {
  data: any[];
  loading: boolean;
  columns: GridColDef[];
  onSearch: (results: any[]) => void;
  onCreate?: () => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onRoles?: (item: any) => void;
  toggleSelect?: (selected: string | string[] | null) => void;
  isSelected?: (id: string) => boolean;
  entityName: string;
  showActions?: boolean;
  fetchAll: () => Promise<any[]>;
  fetchByText: (searchTerm: string) => Promise<any[]>;
  multiSelect?: boolean;
  selectedIds?: string[];
  selectable?: boolean;
}

export const GridSection = ({
  data,
  loading,
  columns,
  onSearch,
  onCreate,
  toggleSelect,
  entityName,
  fetchAll,
  fetchByText,
  multiSelect = false,
  selectedIds,
  selectable = true,
}: GridSectionProps) => {
  // Normaliza ids a GridRowId (number si es numérico, sino string)
  const normalizeId = (id: string | number): GridRowId => {
    const n = Number(id);
    return Number.isFinite(n) ? n : String(id);
  };

  // Modelo de selección que espera tu DataGrid (objeto con Set)
  const emptySelection = (): GridRowSelectionModel => ({
    type: 'include',
    ids: new Set<GridRowId>(),
  });

  const [internalSelection, setInternalSelection] = useState<GridRowSelectionModel>(emptySelection());

  // Si viene selección externa (selectedIds), sincronizala -> pinta el “naranjita”
  useEffect(() => {
    if (!selectedIds) return;
    const next = emptySelection();
    for (const sid of selectedIds) next.ids.add(normalizeId(sid));
    setInternalSelection(next);
  }, [selectedIds]);

  // Handler de selección del grid (recibe el mismo objeto {type, ids})
  const handleRowSelection = useCallback(
    (newModel: GridRowSelectionModel) => {
      // Aseguro estructura válida
      const next: GridRowSelectionModel = {
        type: newModel?.type ?? 'include',
        ids: newModel?.ids instanceof Set ? newModel.ids : new Set<GridRowId>(),
      };
      setInternalSelection(next);

      if (!toggleSelect) return;

      // Convierto Set -> array para notificar al padre
      const idsArr = Array.from(next.ids);
      if (multiSelect) {
        toggleSelect(idsArr.map(String)); // string[]
      } else {
        const last = idsArr.length ? idsArr[idsArr.length - 1] : null;
        toggleSelect(last != null ? String(last) : null); // string | null
      }
    },
    [toggleSelect, multiSelect]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent] = useState<React.ReactNode>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const actionFields = useMemo(() => {
    const fields = new Set<string>();
    for (const column of columns) {
      if (!column) continue;
      const field = column.field ?? '';
      if (field === 'actions' || column.type === 'actions') {
        fields.add(field);
      }
    }
    return fields;
  }, [columns]);

  const isActionCell = useCallback(
    (field: string) => actionFields.has(field),
    [actionFields]
  );

  const handleCellClick = useCallback(
    (params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
      if (isActionCell(params.field)) {
        event.defaultMuiPrevented = true;
        event.stopPropagation();
      }
    },
    [isActionCell]
  );

  return (
    <>
      <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} my={2}>
        <SearchBar
          onSearch={onSearch}
          placeholder={`Buscar ${entityName}...`}
          fetchAll={fetchAll}
          fetchByText={fetchByText}
        />
        <Button sx={{ px: 5 }} variant="outlined" startIcon={<AddIcon />} onClick={onCreate}>
          {entityName}
        </Button>
      </Box>

      <Box width="100%">
        <DataGrid
          // Asegurate que cada fila tenga un ID; si no, definimos un fallback común
          getRowId={(row) => row.id ?? row.ID ?? row.Id ?? row._id}
          rows={data}
          columns={columns}
          loading={loading}
          checkboxSelection={!!selectable}
          hideFooterSelectedRowCount
          // Paginación
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          paginationModel={paginationModel}
          onPaginationModelChange={(m) => setPaginationModel({ ...m, pageSize: 10 })}
          pageSizeOptions={[10]}
          // Selección controlada (objeto con Set) — tal como tipa tu versión
          rowSelectionModel={selectable ? internalSelection : emptySelection()}
          onRowSelectionModelChange={handleRowSelection}
          onCellClick={handleCellClick}
          onCellDoubleClick={handleCellClick}
          // Miscelánea
          localeText={{ noRowsLabel: `No hay resultados.` }}
          sx={{
            '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-columnHeader': { display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
          }}
        />
      </Box>

      <Modal open={modalOpen} title={`${entityName} Details`} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </>
  );
};
