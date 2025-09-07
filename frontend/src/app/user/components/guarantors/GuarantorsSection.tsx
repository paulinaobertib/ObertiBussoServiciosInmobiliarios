import React, { useCallback, useState } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridSection } from "../../../shared/components/GridSection";
import type { Guarantor } from "../../types/guarantor";
import { GuarantorForm } from "./GuarantorForm";
import { Modal } from "../../../shared/components/Modal";
import { useGuarantors } from "../../hooks/useGuarantors";

interface Props {
  toggleSelect?: (ids: number[]) => void;
  isSelected?: (id: number) => boolean;
  showActions?: boolean;
}

export function GuarantorsSection({ toggleSelect, isSelected, showActions = true }: Props) {
  const { guarantors, loading, loadAll, fetchByText } = useGuarantors();

  // Adaptadores para GridSection (multi‑select: number[])
  const gridToggleSelect = useCallback(
    (selected: string | string[] | null) => {
      const arr = Array.isArray(selected) ? selected.map(Number) : selected != null ? [Number(selected)] : [];
      toggleSelect?.(arr);
    },
    [toggleSelect]
  );

  const gridIsSelected = useCallback((id: string) => isSelected?.(Number(id)) ?? false, [isSelected]);

  // ── Modal ──
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const refreshAndClose = async () => {
    await loadAll(); // recarga tras crear/editar/borrar
    setModalOpen(false);
  };

  const openCreate = () => {
    setModalTitle("Crear garante");
    setModalContent(<GuarantorForm action="add" onSuccess={refreshAndClose} onClose={() => setModalOpen(false)} />);
    setModalOpen(true);
  };

  const openEdit = (g: Guarantor) => {
    setModalTitle("Editar garante");
    setModalContent(
      <GuarantorForm action="edit" item={g} onSuccess={refreshAndClose} onClose={() => setModalOpen(false)} />
    );
    setModalOpen(true);
  };

  const openDelete = (g: Guarantor) => {
    setModalTitle("Eliminar garante");
    setModalContent(
      <GuarantorForm action="delete" item={g} onSuccess={refreshAndClose} onClose={() => setModalOpen(false)} />
    );
    setModalOpen(true);
  };

  // Columnas: datos + acciones (si showActions)
  const columns: any[] = [
    { field: "name", headerName: "Nombre", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
  ];
  if (showActions) {
    columns.push({
      field: "actions",
      headerName: "Acciones",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} width="100%" height="100%">
          <IconButton size="small" title="Editar" onClick={() => openEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" title="Eliminar" onClick={() => openDelete(params.row)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    });
  }

  // Spinner solo si todavía no hay datos cargados
  if (loading && (!guarantors || guarantors.length === 0)) {
    return (
      <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <>
      <GridSection
        data={guarantors}
        loading={loading}
        columns={columns}
        onSearch={() => { }} 
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
        onRoles={undefined}
        toggleSelect={gridToggleSelect}
        isSelected={gridIsSelected}
        entityName="Garante"
        showActions={showActions}
        fetchAll={loadAll}
        fetchByText={fetchByText}
        multiSelect={true}
        selectable={true}
      />

      <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </>
  );
}
