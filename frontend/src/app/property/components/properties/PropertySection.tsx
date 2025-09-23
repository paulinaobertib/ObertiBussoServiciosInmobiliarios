import { useCallback, useMemo } from "react";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { GridSection } from "../../../shared/components/GridSection";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { usePropertyPanel as usePropertySection } from "../../hooks/usePropertySection"; // ← tu hook
import {
  getAllProperties,
  getAvailableProperties,
  getPropertiesByText,
  deleteProperty as svcDeleteProperty,
} from "../../services/property.service";
import type { Property } from "../../types/property";
import type { GridRowId } from "@mui/x-data-grid";
import { useApiErrors } from "../../../shared/hooks/useErrors";

// 🔹 Íconos pedidos (mismos que usabas en getRowActions)
import CommentIcon from "@mui/icons-material/Comment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

// 🔹 Para navegar a rutas específicas
import { usePropertiesContext } from "../../context/PropertiesContext";
import { ROUTES, buildRoute } from "../../../../lib";

interface Props {
  toggleSelect?: (id: number | null) => void;
  isSelected?: (id: number) => boolean;
  showActions?: boolean;
  filterAvailable?: boolean;
  selectable?: boolean;
  selectedIds?: number[];
  showCreateButton?: boolean;
  availableOnly?: boolean;
}

export const PropertySection = ({
  toggleSelect: externalToggle,
  isSelected: externalIsSelected,
  showActions = true,
  filterAvailable = false,
  selectable = true,
  selectedIds,
  showCreateButton = true,
  availableOnly = false,
}: Props) => {
  const navigate = useNavigate();
  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();
  const { pickItem } = usePropertiesContext();

  // Tu hook (lo tenías como usePropertySection)
  const {
    data: properties = [],
    loading,
    onSearch,
    toggleSelect: internalToggle,
    isSelected: internalIsSelected,
  } = usePropertySection(availableOnly ? "available" : "all");

  const rows = useMemo(
    () => properties.map((p) => ({ ...p, id: Number((p as any).id ?? (p as any).propertyId) })),
    [properties]
  );

  const gridToggleSelect = useCallback(
    (selected: GridRowId | GridRowId[] | null) => {
      const toNum = (v: GridRowId) => Number(v);
      const last = Array.isArray(selected) ? (selected.length ? selected[selected.length - 1] : null) : selected;
      const num = last == null ? null : toNum(last);
      if (externalToggle) {
        externalToggle(num != null && !Number.isNaN(num) ? num : null);
      } else if (num != null && !Number.isNaN(num)) {
        internalToggle(num);
      } else {
        internalToggle(null as any);
      }
    },
    [externalToggle, internalToggle]
  );

  const gridIsSelected = useCallback(
    (id: GridRowId) => (externalIsSelected ?? internalIsSelected)(Number(id)),
    [externalIsSelected, internalIsSelected]
  );

  const fetchAll = useCallback(async () => {
    const res = await (availableOnly ? getAvailableProperties() : getAllProperties());
    onSearch(res);
    return res;
  }, [availableOnly, onSearch]);

  const fetchByText = useCallback(
    async (term: string) => {
      const list = await getPropertiesByText(term);
      const normalized = availableOnly
        ? (list ?? []).filter((p: any) => String(p?.status ?? "").toLowerCase() === "disponible")
        : list;
      onSearch(normalized);
      return normalized;
    },
    [availableOnly, onSearch]
  );

  // id seleccionado para forzar inclusión aunque no esté “disponible”
  const selectedIdNum = useMemo(
    () => (Array.isArray(selectedIds) && selectedIds.length ? selectedIds[0] : null),
    [selectedIds]
  );

  // Filtrado opcional (incluye siempre la fila seleccionada)
  const filteredRows = useMemo(() => {
    if (!filterAvailable) return rows;
    return rows.filter((p) => {
      const isAvailable = !p.status || String(p.status).toLowerCase() === "disponible";
      const isSelectedRow = selectedIdNum != null && p.id === selectedIdNum;
      return isAvailable || isSelectedRow;
    });
  }, [rows, filterAvailable, selectedIdNum]);

  // Navegaciones
  const openCreate = () => navigate("/properties/new");
  const openEdit = (p: Property) => navigate(buildRoute(ROUTES.EDIT_PROPERTY, p.id));
  const openNotes = (p: Property) => {
    pickItem("property", p);
    navigate(buildRoute(ROUTES.PROPERTY_NOTES, p.id));
  };
  const openDetails = (p: Property) => {
    pickItem("property", p);
    navigate(buildRoute(ROUTES.PROPERTY_DETAILS, p.id));
  };

  // --------- Confirmación y eliminación ----------
  const confirmDelete = useCallback(
    async (label: string) => {
      if (typeof alertApi?.doubleConfirm === "function") {
        return await alertApi.doubleConfirm({
          kind: "error",
          title: `Vas a eliminar "${label}"`,
          description: "Esta acción no se puede deshacer.",
        });
      }
    },
    [alertApi]
  );

  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Volver" });
      }
    },
    [alertApi]
  );

  const handleDelete = useCallback(
    async (p: Property) => {
      const label = p?.title ?? `propiedad #${p?.id ?? ""}`;
      const ok = await confirmDelete(label);
      if (!ok) return;

      try {
        await svcDeleteProperty(p);
        await notifySuccess("Propiedad eliminada", `"${label}" se eliminó correctamente.`);
        await fetchAll(); // refrescamos la grilla
      } catch (e) {
        handleError(e);
      }
    },
    [confirmDelete, notifySuccess, fetchAll, handleError]
  );

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  const columns = [
    { field: "title", headerName: "Título", flex: 1 },
    { field: "operation", headerName: "Operación", flex: 1 },
    {
      field: "price",
      headerName: "Precio",
      flex: 1,
      renderCell: (params: any) => {
        const row: Partial<Property> = params.row ?? {};
        return (
          <Typography>
            {row.currency ?? ""} {row.price != null ? row.price : "—"}
          </Typography>
        );
      },
    },
    ...(showActions
      ? [
          {
            field: "actions",
            headerName: "Acciones",
            width: 200,
            sortable: false,
            filterable: false,
            renderCell: (params: any) => {
              const row = params.row as Property;
              return (
                <Box display="flex" gap={1} height="100%" alignItems="center" justifyContent="center" width="100%">
                  {/* MISMO ÍCONO Y MISMA FUNCIÓN: Notas */}
                  <IconButton size="small" title="Notas" onClick={() => openNotes(row)}>
                    <CommentIcon fontSize="small" />
                  </IconButton>
                  {/* MISMO ÍCONO Y MISMA FUNCIÓN: Ver propiedad */}
                  <IconButton size="small" title="Ver propiedad" onClick={() => openDetails(row)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  {/* MISMO ÍCONO: Editar */}
                  <IconButton size="small" title="Editar" onClick={() => openEdit(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {/* MISMO ÍCONO: Eliminar (ahora con doble confirmación + éxito) */}
                  <IconButton size="small" title="Eliminar" onClick={() => handleDelete(row)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <GridSection
      data={filteredRows}
      loading={loading}
      columns={columns}
      onSearch={onSearch}
      onCreate={openCreate}
      onEdit={openEdit}
      onDelete={() => {}}
      toggleSelect={gridToggleSelect}
      isSelected={gridIsSelected}
      entityName="Propiedad"
      showActions={showActions}
      fetchAll={fetchAll}
      fetchByText={fetchByText}
      multiSelect={false}
      selectable={selectable}
      selectedIds={selectedIds}
      showCreateButton={showCreateButton}
    />
  );
};

export default PropertySection;
