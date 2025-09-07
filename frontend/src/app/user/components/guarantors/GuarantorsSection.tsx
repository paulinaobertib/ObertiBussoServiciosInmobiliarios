import React, { useCallback, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { GridSection } from "../../../shared/components/GridSection";
import type { Guarantor } from "../../types/guarantor";
import { GuarantorForm } from "./GuarantorForm";
import { Modal } from "../../../shared/components/Modal";
import { useGuarantors } from "../../hooks/useGuarantors";

interface Props {
  toggleSelect?: (ids: number[]) => void;
  isSelected?: (id: number) => boolean;
}

export function GuarantorsSection({ toggleSelect, isSelected }: Props) {
  // ⬅️ Igual que UsersSection: usamos el store del hook
  const { guarantors, loading, loadAll, fetchByText } = useGuarantors();

  // Columnas (idéntico formato al de UsersSection)
  const columns = [
    { field: "name", headerName: "Nombre", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
  ];

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
        showActions={true}
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
