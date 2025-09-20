import { useState, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import { GridSection } from "../../../shared/components/GridSection";
import type { Utility } from "../../types/utility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Modal } from "../../../shared/components/Modal";
import { UtilitiesForm } from "./UtilitiesForm";
import { useUtilities } from "../../hooks/useUtilities";
import type { GridRowId } from "@mui/x-data-grid";

interface Props {
  toggleSelect?: (ids: number[]) => void;
  isSelected?: (id: number) => boolean;
  showActions?: boolean;
  multiSelect?: boolean; // permite elegir si es selección múltiple o única
}

export function UtilitiesSection({ toggleSelect, isSelected, showActions = true, multiSelect = true }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const { loading, loadAll, fetchByText } = useUtilities();
  const [rows, setRows] = useState<Utility[]>([]);

  const columns = [
    { field: "name", headerName: "Nombre", flex: 1 },
    ...(showActions
      ? [
          {
            field: "actions",
            headerName: "Acciones",
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params: any) => (
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} width="100%">
                <IconButton size="small" title="Editar" onClick={() => openEdit(params.row)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" title="Eliminar" onClick={() => openDelete(params.row)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ),
          },
        ]
      : []),
  ];

  // Helper para convertir GridRowId a number seguro
  const toNum = (v: GridRowId): number | null =>
    typeof v === "number"
      ? v
      : Number.isFinite(Number(v))
      ? Number(v)
      : null;

  const gridToggleSelect = useCallback(
    (selected: GridRowId | GridRowId[] | null) => {
      const arr: number[] = Array.isArray(selected)
        ? selected
            .map(toNum)
            .filter((n): n is number => n != null)
        : selected != null
        ? (() => {
            const n = toNum(selected);
            return n != null ? [n] : [];
          })()
        : [];
      toggleSelect?.(arr);
    },
    [toggleSelect]
  );

  const gridIsSelected = useCallback(
    (id: GridRowId) => {
      const n = toNum(id);
      return n != null ? isSelected?.(n) ?? false : false;
    },
    [isSelected]
  );

  const refresh = useCallback(async () => {
    const list = await loadAll();
    setRows(list);
  }, [loadAll]);

  const openEdit = (u: Utility) => {
    setModalTitle("Editar utility");
    setModalContent(
      <UtilitiesForm
        action="edit"
        item={u}
        onDone={async () => {
          await refresh();
          setModalOpen(false);
        }}
      />
    );
    setModalOpen(true);
  };

  const openDelete = (u: Utility) => {
    setModalTitle("Eliminar utility");
    setModalContent(
      <UtilitiesForm
        action="delete"
        item={u}
        onDone={async () => {
          await refresh();
          setModalOpen(false);
        }}
      />
    );
    setModalOpen(true);
  };

  const openCreate = () => {
    setModalTitle("Crear utility");
    setModalContent(
      <UtilitiesForm
        action="add"
        onDone={async () => {
          await refresh();
          setModalOpen(false);
        }}
      />
    );
    setModalOpen(true);
  };

  const fetchAllAdapter = useCallback(async () => {
    const list = await loadAll();
    setRows(list);
    return list;
  }, [loadAll]);

  const fetchByTextAdapter = useCallback(
    async (q: string) => {
      const list = await fetchByText(q);
      setRows(list);
      return list;
    },
    [fetchByText]
  );

  return (
    <>
      <GridSection
        data={rows}
        loading={loading}
        columns={columns}
        onSearch={(results) => setRows(results as Utility[])}
        onCreate={showActions ? openCreate : undefined}
        onEdit={openEdit}
        onDelete={openDelete}
        onRoles={undefined}
        toggleSelect={gridToggleSelect}
        isSelected={gridIsSelected}
        entityName="Utility"
        showActions={showActions}
        fetchAll={fetchAllAdapter}
        fetchByText={fetchByTextAdapter}
        multiSelect={multiSelect}
        selectable={true}
      />

      <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </>
  );
}
