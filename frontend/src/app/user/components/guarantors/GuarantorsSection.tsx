import { useState, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
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
  multiSelect?: boolean;
}

export const GuarantorsSection = ({ toggleSelect, isSelected, showActions = true, multiSelect = true }: Props) => {
  const { loadAll, fetchByText } = useGuarantors();

  const [rows, setRows] = useState<Guarantor[]>([]);
  const [busy, setBusy] = useState(false);

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const fetchAll = useCallback(async () => {
    if (busy || hasLoadedOnce) return rows;
    setBusy(true);
    try {
      const list = await loadAll();
      setHasLoadedOnce(true);
      return Array.isArray(list) ? list : [];
    } finally {
      setBusy(false);
    }
  }, [busy, hasLoadedOnce, loadAll, rows]);

  // 2) fetchByText: se usa para búsquedas (acción explícita), no toca hasLoadedOnce
  const loadByText = useCallback(
    async (q: string) => {
      setBusy(true);
      try {
        const list = await fetchByText(q);
        return Array.isArray(list) ? list : [];
      } finally {
        setBusy(false);
      }
    },
    [fetchByText]
  );

  // 3) onSearch: el Grid nos entrega los resultados; actualizamos filas controladas
  const onSearch = useCallback((results: any[]) => {
    setRows((results as Guarantor[]) ?? []);
  }, []);

  const gridToggleSelect = useCallback(
    (selected: string | string[] | null) => {
      if (!toggleSelect) return;
      const ids =
        selected == null
          ? []
          : Array.isArray(selected)
          ? selected.map((s) => Number(s)).filter((n) => !Number.isNaN(n))
          : [Number(selected)].filter((n) => !Number.isNaN(n));
      toggleSelect(ids);
    },
    [toggleSelect]
  );

  const gridIsSelected = useCallback((id: string) => (isSelected ? isSelected(Number(id)) : false), [isSelected]);

  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "delete"; item?: Guarantor | null }>({
    open: false,
    mode: "add",
    item: null,
  });

  const openCreate = useCallback(() => setDlg({ open: true, mode: "add", item: null }), []);
  const openEdit = useCallback((g: Guarantor) => setDlg({ open: true, mode: "edit", item: g }), []);
  const openDelete = useCallback((g: Guarantor) => setDlg({ open: true, mode: "delete", item: g }), []);
  const closeDlg = useCallback(() => setDlg((s) => ({ ...s, open: false })), []);

  // Refresh explícito al guardar/borrar (UNA llamada) y cerrar modal
  const refreshAndClose = useCallback(async () => {
    setBusy(true);
    try {
      const list = await loadAll();
      setRows(Array.isArray(list) ? (list as Guarantor[]) : []);
      setHasLoadedOnce(true); // mantenemos cache cargado para que el grid no refetchee
    } finally {
      setBusy(false);
    }
    closeDlg();
  }, [loadAll, closeDlg]);

  /* ================= Columnas ================= */

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

  return (
    <>
      <GridSection
        data={rows}
        loading={busy}
        columns={columns}
        onSearch={onSearch}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
        entityName="Garante"
        toggleSelect={gridToggleSelect}
        isSelected={gridIsSelected}
        fetchAll={fetchAll}
        fetchByText={loadByText}
        multiSelect={multiSelect}
        selectable
      />

      <GuarantorDialog
        open={dlg.open}
        mode={dlg.mode}
        item={dlg.item ?? undefined}
        onClose={closeDlg}
        onSaved={refreshAndClose}
      />
    </>
  );
};
