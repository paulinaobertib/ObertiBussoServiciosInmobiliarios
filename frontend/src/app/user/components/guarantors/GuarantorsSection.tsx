import { useCallback, useState } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridSection } from "../../../shared/components/GridSection";
import type { Guarantor } from "../../types/guarantor";
import { GuarantorDialog } from "./GuarantorDialog";
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

  // ── Dialog unificado ──
  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "delete"; item?: Guarantor | null }>({
    open: false,
    mode: "add",
    item: null,
  });

  const refreshAndClose = async () => {
    await loadAll();
  };

  const openCreate = () => setDlg({ open: true, mode: "add", item: null });
  const openEdit = (g: Guarantor) => setDlg({ open: true, mode: "edit", item: g });
  const openDelete = (g: Guarantor) => setDlg({ open: true, mode: "delete", item: g });

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
        onSearch={() => {}}
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

      <GuarantorDialog
        open={dlg.open}
        mode={dlg.mode}
        item={dlg.item ?? undefined}
        onClose={() => setDlg((s) => ({ ...s, open: false }))}
        onSaved={refreshAndClose}
      />
    </>
  );
}
