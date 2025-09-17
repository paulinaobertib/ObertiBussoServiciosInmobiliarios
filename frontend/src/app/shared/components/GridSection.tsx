// GridSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridRowSelectionModel,
  GridCallbackDetails,
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
  /** el grid expone/recibe IDs como GridRowId (string|number) */
  toggleSelect?: (selected: GridRowId | GridRowId[] | null) => void;
  isSelected?: (id: GridRowId) => boolean;
  entityName: string;
  showActions?: boolean;
  fetchAll: () => Promise<any[]>;
  fetchByText: (searchTerm: string) => Promise<any[]>;
  multiSelect?: boolean;
  /** los preseleccionados también aceptan number o string */
  selectedIds?: GridRowId[];
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

  const emptySelection = (): GridRowSelectionModel => ({
    type: 'include',
    ids: new Set<GridRowId>(),
  });

  const [internalSelection, setInternalSelection] = useState<GridRowSelectionModel>(emptySelection());

  useEffect(() => {
    if (!selectedIds) return;
    const next = emptySelection();
    for (const id of selectedIds) next.ids.add(id);
    setInternalSelection(next);
  }, [selectedIds]);

  const handleRowSelection = useCallback(
    (newModel: GridRowSelectionModel, _details: GridCallbackDetails) => {
      const next: GridRowSelectionModel = {
        type: newModel?.type ?? 'include',
        ids: newModel?.ids instanceof Set ? newModel.ids : new Set<GridRowId>(),
      };
      setInternalSelection(next);

      if (!toggleSelect) return;

      const idsArr = Array.from(next.ids);
      if (multiSelect) {
        toggleSelect(idsArr); // GridRowId[]
      } else {
        const last = idsArr.length ? idsArr[idsArr.length - 1] : null;
        toggleSelect(last ?? null); // GridRowId | null
      }
    },
    [toggleSelect, multiSelect]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent] = useState<React.ReactNode>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

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
          getRowId={(row) => row.id ?? row.ID ?? row.Id ?? row._id}
          rows={data}
          columns={columns}
          loading={loading}
          checkboxSelection={!!selectable}
          hideFooterSelectedRowCount
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          paginationModel={paginationModel}
          onPaginationModelChange={(m) => setPaginationModel({ ...m, pageSize: 10 })}
          pageSizeOptions={[10]}
          rowSelectionModel={selectable ? internalSelection : emptySelection()}
          onRowSelectionModelChange={handleRowSelection}
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
