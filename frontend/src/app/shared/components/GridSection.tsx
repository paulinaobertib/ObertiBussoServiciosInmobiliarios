import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button } from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
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
    // Si se controla desde afuera, usar el prop. Si no, manejar interno.
    const [internalSelection, setInternalSelection] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });

    // Sincronizar selección externa si viene por props
    useEffect(() => {
        if (selectedIds) {
            setInternalSelection({
                type: 'include',
                ids: new Set(selectedIds.map(id => id)),
            });
        }
    }, [selectedIds]);

    const handleRowSelection = useCallback(
        (newModel: GridRowSelectionModel) => {
            // extraemos los IDs (pueden ser string o number)
            const ids = Array.from(newModel.ids);

            if (multiSelect) {
                // convertimos todo a string[]
                const stringIds = ids.map((id) => String(id));
                // notificamos al padre con el array
                toggleSelect?.(stringIds);
                // actualizamos nuestro estado interno (manteniendo los GridRowId originales)
                setInternalSelection({
                    type: 'include',
                    ids: new Set(ids),
                });
            } else {
                // tomamos el último o ninguno
                const last = ids.length > 0 ? ids[ids.length - 1] : null;
                const lastStr = last !== null ? String(last) : null;
                // notificamos al padre con string o null
                toggleSelect?.(lastStr);
                // actualizamos internamente
                setInternalSelection({
                    type: 'include',
                    ids: last !== null ? new Set([last]) : new Set(),
                });
            }
        },
        [toggleSelect, multiSelect]
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent] = useState<React.ReactNode>(null);



    return (
        <>
            <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} my={2}>
                <SearchBar
                    onSearch={onSearch}
                    placeholder={`Search ${entityName}…`}
                    fetchAll={fetchAll}
                    fetchByText={fetchByText}
                />
                <Button variant="outlined" startIcon={<AddIcon />} onClick={onCreate}>
                    {entityName}
                </Button>
            </Box>

            <Box height={500} width="100%">
                <DataGrid
                    rows={data}
                    columns={columns}
                    loading={loading}
                    checkboxSelection={selectable}
                    disableRowSelectionOnClick
                    hideFooterSelectedRowCount
                    {...(selectable
                        ? {
                            rowSelectionModel: internalSelection,
                            onRowSelectionModelChange: (newModel: GridRowSelectionModel) =>
                                handleRowSelection(newModel),
                        }
                        : {})}
                    localeText={{ noRowsLabel: `No hay resultados.` }}

                    sx={{
                        // Centra verticalmente todas las celdas de datos...
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                        },
                        // ...y también las cabeceras de columna si quieres
                        '& .MuiDataGrid-columnHeader': {
                            display: 'flex',
                            alignItems: 'center',
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 'bold',
                        },
                    }}
                />
            </Box>

            <Modal open={modalOpen} title={`${entityName} Details`} onClose={() => setModalOpen(false)}>
                {modalContent}
            </Modal>
        </>
    );
};
