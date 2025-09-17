import { useState, useCallback } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { GridColDef, GridRowId } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridSection } from "../../../shared/components/GridSection";
import { useCategorySection } from "../../hooks/useCategorySection";
import { translate } from "../../utils/translate";
import { ModalItem, Info } from "./CategoryModal";
import { AmenityForm } from "../forms/AmenityForm";
import { OwnerForm } from "../forms/OwnerForm";
import { TypeForm } from "../forms/TypeForm";
import { NeighborhoodForm } from "../forms/NeighborhoodForm";
import type { Category } from "../../context/PropertiesContext";
import { usePropertiesContext } from "../../context/PropertiesContext";

const formRegistry = {
  amenity: AmenityForm,
  owner: OwnerForm,
  type: TypeForm,
  neighborhood: NeighborhoodForm,
} as const;

// Helpers para parsear IDs del DataGrid (string | number)
const toNum = (v: GridRowId): number | null =>
  typeof v === "number" ? v : Number.isFinite(Number(v)) ? Number(v) : null;

export const CategorySection = ({ category, selectable = true }: { category: Category; selectable?: boolean }) => {
  const {
    data,
    loading,
    refresh,
    onSearch,
    toggleSelect: internalToggle,
    isSelected: internalIsSelected,
  } = useCategorySection(category);

  // Selección global (sembrada desde la Property)
  const { selected: globalSelected } = usePropertiesContext();

  // Adaptadores para GridSection
  const gridToggleSelect = useCallback(
    (sel: GridRowId | GridRowId[] | null) => {
      if (!selectable) return;

      if (category === "amenity") {
        // multi: recibimos el conjunto completo de seleccionados (GridRowId[])
        const incoming = Array.isArray(sel) ? sel : [];
        const next = new Set(incoming.map(toNum).filter((n): n is number => n != null));
        const prev = new Set(globalSelected.amenities);

        // Agregados
        for (const id of next) if (!prev.has(id)) internalToggle(id);
        // Quitados
        for (const id of prev) if (!next.has(id)) internalToggle(id);
        return;
      }

      // single: recibimos el último seleccionado como GridRowId o null
      const prevId =
        category === "type"
          ? globalSelected.type
          : category === "neighborhood"
          ? globalSelected.neighborhood
          : globalSelected.owner;

      const nextId = sel != null && !Array.isArray(sel) ? toNum(sel) : null;

      if (nextId == null && prevId != null) {
        // deseleccionó todo -> toggle en el anterior para apagarlo
        internalToggle(prevId);
      } else if (nextId != null && nextId !== prevId) {
        // seleccionó un id distinto
        internalToggle(nextId);
      }
    },
    [category, selectable, internalToggle, globalSelected]
  );

  const gridIsSelected = useCallback(
    (id: GridRowId) => {
      const n = toNum(id);
      return n != null ? internalIsSelected(n) : false;
    },
    [internalIsSelected]
  );

  // Búsqueda local: no hay endpoint remoto, filtramos en memoria
  const fetchAll = useCallback(async () => {
    await refresh();
    onSearch(data);
    return data;
  }, [refresh, onSearch, data]);

  const fetchByText = useCallback(
    async (term: string) => {
      const lower = term.trim().toLowerCase();
      if (!lower) {
        onSearch(data);
        return data;
      }
      const columnsMap: Record<Category, string[]> = {
        owner: ["firstName", "lastName", "email", "phone"],
        amenity: ["name"],
        type: ["name"],
        neighborhood: ["name", "city", "type"],
      };
      const keys = columnsMap[category] || [];
      const filtered = data.filter((item) =>
        keys.some((key) => {
          const value = String((item as any)[key] ?? "").toLowerCase();
          return value.includes(lower);
        })
      );
      onSearch(filtered);
      return filtered;
    },
    [category, data, onSearch]
  );

  // Columnas dinámicas
  const headersMap: Record<Category, { field: string; headerName: string }[]> = {
    owner: [
      { field: "firstName", headerName: "Nombre" },
      { field: "lastName", headerName: "Apellido" },
      { field: "email", headerName: "Email" },
      { field: "phone", headerName: "Teléfono" },
    ],
    amenity: [{ field: "name", headerName: "Nombre" }],
    type: [
      { field: "name", headerName: "Nombre" },
      { field: "hasRooms", headerName: "Ambientes" },
      { field: "hasBedrooms", headerName: "Dormitorios" },
      { field: "hasBathrooms", headerName: "Baños" },
      { field: "hasCoveredArea", headerName: "Área Cubierta" },
    ],
    neighborhood: [
      { field: "name", headerName: "Nombre" },
      { field: "city", headerName: "Ciudad" },
      { field: "type", headerName: "Tipo" },
    ],
  };

  const columns: GridColDef[] = headersMap[category].map((col) => {
    const isBooleanField =
      category === "type" && ["hasRooms", "hasBedrooms", "hasBathrooms", "hasCoveredArea"].includes(col.field);

    return {
      field: col.field,
      headerName: col.headerName,
      flex: 1,
      renderCell: isBooleanField
        ? (params: any) => {
            const value = params.row?.[col.field];
            return typeof value === "boolean" ? (value ? "Sí" : "No") : "-";
          }
        : undefined,
    };
  });

  // Columna de acciones
  columns.push({
    field: "actions",
    headerName: "Acciones",
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const item = params.row;
      return (
        <Box>
          <IconButton size="small" title="Editar" onClick={() => handleOpen("edit", item)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" title="Eliminar" onClick={() => handleOpen("delete", item)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      );
    },
  });

  // Modal handlers
  const [modal, setModal] = useState<Info | null>(null);
  const handleOpen = (action: "add" | "edit" | "delete", item?: any) => {
    setModal({
      title: `${action === "add" ? "Crear" : action === "edit" ? "Editar" : "Eliminar"} ${translate(category)}`,
      Component: formRegistry[category],
      componentProps: { action, item },
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  // IDs seleccionados (controlados) para que el DataGrid pinte
  const selectedIds: GridRowId[] =
    category === "amenity"
      ? [...globalSelected.amenities] // números OK (GridRowId = number | string)
      : (() => {
          const id =
            category === "type"
              ? globalSelected.type
              : category === "neighborhood"
              ? globalSelected.neighborhood
              : globalSelected.owner;
          return id != null ? [id] : [];
        })();

  return (
    <>
      <GridSection
        data={data}
        loading={loading}
        columns={columns}
        onSearch={onSearch}
        onCreate={() => handleOpen("add")}
        onEdit={(item) => handleOpen("edit", item)}
        onDelete={(item) => handleOpen("delete", item)}
        toggleSelect={gridToggleSelect}
        isSelected={gridIsSelected}
        entityName={translate(category)}
        showActions={true}
        fetchAll={fetchAll}
        fetchByText={fetchByText}
        multiSelect={category === "amenity"}
        selectable={selectable}
        selectedIds={selectedIds}
      />
      <ModalItem info={modal} close={() => setModal(null)} />
    </>
  );
};
