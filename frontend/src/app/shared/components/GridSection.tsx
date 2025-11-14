import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Card } from "@mui/material";
import { DataGrid, GridColDef, GridRowId, GridRowSelectionModel, GridCallbackDetails } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { Modal } from "./Modal";
import { SearchBar } from "./SearchBar";
import { EmptyState } from "./EmptyState";

interface GridSectionProps {
  data: any[];
  loading: boolean;
  columns: GridColDef[];
  onSearch: (results: any[] | null) => void;
  onCreate?: () => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onRoles?: (item: any) => void;
  /** el grid expone/recibe IDs como GridRowId (string|number) */
  toggleSelect?: (selected: GridRowId | GridRowId[] | null) => void;
  isSelected?: (id: GridRowId) => boolean;
  entityName: string;
  showActions?: boolean;
  fetchAll?: () => Promise<any[]>;
  fetchByText: (searchTerm: string) => Promise<any[]>;
  multiSelect?: boolean;
  /** los preseleccionados también aceptan number o string */
  selectedIds?: GridRowId[];
  selectable?: boolean;
  showCreateButton?: boolean;
  error?: string | null;
}

const GRID_PAGE_SIZE = 5;
const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 56;
const FOOTER_HEIGHT = 52;
const GRID_MIN_HEIGHT = HEADER_HEIGHT + ROW_HEIGHT * GRID_PAGE_SIZE + FOOTER_HEIGHT;
const resolveRowId = (row: any): GridRowId => row?.id ?? row?.ID ?? row?.Id ?? row?._id;

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
  showCreateButton = true,
  error,
}: GridSectionProps) => {
  const emptySelection = (): GridRowSelectionModel => ({
    type: "include",
    ids: new Set<GridRowId>(),
  });

  const [internalSelection, setInternalSelection] = useState<GridRowSelectionModel>(emptySelection());

  useEffect(() => {
    if (!selectedIds) return;
    const next = emptySelection();
    for (const id of selectedIds) next.ids.add(id);
    setInternalSelection(next);
  }, [selectedIds]);

  const normalizeSelection = useCallback(
    (model: GridRowSelectionModel): GridRowSelectionModel => {
      if (!model) return emptySelection();
      if (model.type === "include") {
        return {
          type: "include",
          ids: model.ids instanceof Set ? model.ids : new Set<GridRowId>(),
        };
      }
      const excluded = model.ids instanceof Set ? model.ids : new Set<GridRowId>();
      const includedIds = data.map((row) => resolveRowId(row)).filter((id) => !excluded.has(id));
      return {
        type: "include",
        ids: new Set(includedIds),
      };
    },
    [data]
  );

  const handleRowSelection = useCallback(
    (newModel: GridRowSelectionModel, _details: GridCallbackDetails) => {
      const normalized = normalizeSelection(newModel);

      if (!multiSelect) {
        const lastSelected = Array.from(normalized.ids).pop();
        normalized.ids = lastSelected != null ? new Set<GridRowId>([lastSelected]) : new Set<GridRowId>();
      }
      setInternalSelection(normalized);

      if (!toggleSelect) return;

      const idsArr = Array.from(normalized.ids);
      if (multiSelect) {
        toggleSelect(idsArr);
      } else {
        const last = idsArr.length ? idsArr[idsArr.length - 1] : null;
        toggleSelect(last ?? null);
      }
    },
    [normalizeSelection, toggleSelect, multiSelect]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent] = useState<React.ReactNode>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: GRID_PAGE_SIZE });

  const hasRows = Array.isArray(data) && data.length > 0;

  return (
    <>
      <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} my={2}>
        <SearchBar
          onSearch={onSearch}
          placeholder={`Buscar ${entityName}...`}
          fetchAll={fetchAll}
          fetchByText={fetchByText}
        />
        {showCreateButton && onCreate && (
          <Button
            sx={{ px: 5 }}
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onCreate}
            data-testid={`add-${entityName.toLowerCase()}-button`}
          >
            {entityName}
          </Button>
        )}
      </Box>

      {error ? (
        <EmptyState title="No pudimos cargar la información." tone="error" minHeight={GRID_MIN_HEIGHT} />
      ) : !loading && !hasRows ? (
        <EmptyState title="No hay registros disponibles." minHeight={GRID_MIN_HEIGHT} />
      ) : (
        <Card sx={{ width: "100%", overflow: "hidden", minHeight: GRID_MIN_HEIGHT }}>
          <DataGrid
            getRowId={resolveRowId}
            rows={data}
            columns={columns}
            loading={loading}
            checkboxSelection={!!selectable}
            hideFooterSelectedRowCount
            paginationModel={paginationModel}
            onPaginationModelChange={(m) => setPaginationModel({ ...m, pageSize: GRID_PAGE_SIZE })}
            pageSizeOptions={[GRID_PAGE_SIZE]}
            rowSelectionModel={selectable ? internalSelection : emptySelection()}
            onRowSelectionModelChange={handleRowSelection}
            sx={{
              border: 0,
              minHeight: GRID_MIN_HEIGHT,
              "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
              "& .MuiDataGrid-columnHeader": { display: "flex", alignItems: "center", bgcolor: "rgba(0,0,0,0.02)" },
              "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
              "& .MuiDataGrid-virtualScroller": {
                minHeight: ROW_HEIGHT * GRID_PAGE_SIZE,
              },
            }}
          />
        </Card>
      )}

      <Modal open={modalOpen} title={`${entityName} Details`} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </>
  );
};
