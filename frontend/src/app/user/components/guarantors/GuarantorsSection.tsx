// GuarantorsSection.tsx
import { useCallback, useMemo, useState } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridSection } from "../../../shared/components/GridSection";
import type { Guarantor } from "../../types/guarantor";
import { GuarantorDialog } from "./GuarantorDialog";
import { useGuarantors } from "../../hooks/useGuarantors";
import type { GridRowId } from "@mui/x-data-grid";

interface Props {
  toggleSelect?: (ids: number[]) => void;
  isSelected?: (id: number) => boolean;
  showActions?: boolean;
  selectedIds?: number[]; // numero
}

export function GuarantorsSection({ toggleSelect, isSelected, showActions = true, selectedIds }: Props) {
  const { guarantors, loading, loadAll, fetchByText } = useGuarantors();

  // id numero
  const rows = useMemo(
    () => (guarantors ?? []).map((g) => ({ ...g, id: Number((g as any).id ?? (g as any).guarantorId) })),
    [guarantors]
  );

  // Adaptadores para GridSection
  const gridToggleSelect = useCallback(
    (selected: GridRowId | GridRowId[] | null) => {
      const toNum = (v: GridRowId) => Number(v);
      const arr =
        selected == null
          ? []
          : Array.isArray(selected)
          ? selected.map(toNum).filter((n) => !Number.isNaN(n))
          : [toNum(selected)].filter((n) => !Number.isNaN(n));
      toggleSelect?.(arr); // numero
    },
    [toggleSelect]
  );

  const gridIsSelected = useCallback((id: GridRowId) => isSelected?.(Number(id)) ?? false, [isSelected]);

  // ── Diálogo ──
  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "delete"; item?: Guarantor | null }>({
    open: false,
    mode: "add",
    item: null,
  });

  const refreshAndClose = async () => {
    await loadAll();
    setDlg((s) => ({ ...s, open: false }));
  };

  const openCreate = () => setDlg({ open: true, mode: "add", item: null });
  const openEdit = (g: Guarantor) => setDlg({ open: true, mode: "edit", item: g });
  const openDelete = (g: Guarantor) => setDlg({ open: true, mode: "delete", item: g });

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
          <IconButton
            size="small"
            title="Editar"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openEdit(params.row as Guarantor);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            title="Eliminar"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openDelete(params.row as Guarantor);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    });
  }

  if (loading && rows.length === 0) {
    return (
      <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <>
      <GridSection
        data={rows}
        loading={loading}
        columns={columns}
        onSearch={() => {}}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
        toggleSelect={gridToggleSelect}
        isSelected={gridIsSelected}
        entityName="Garante"
        showActions={showActions}
        fetchAll={loadAll}
        fetchByText={fetchByText}
        multiSelect
        selectable
        selectedIds={selectedIds}
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
