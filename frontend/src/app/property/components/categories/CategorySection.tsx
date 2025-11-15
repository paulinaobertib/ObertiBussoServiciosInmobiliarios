import { useState, useCallback } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { GridColDef, GridRowId } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
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

// Tipos correctos
import type { Owner as OwnerT } from "../../types/owner";

// Modal ya existente en tu proyecto (mismo folder)
import { OwnerPropertiesModal } from "./OwnerPropertiesModal";
import { AddressSelector } from "../propertyDetails/maps/AddressSelector";

// Helpers para parsear IDs del DataGrid (string | number)
const toNum = (v: GridRowId): number | null =>
  typeof v === "number" ? v : Number.isFinite(Number(v)) ? Number(v) : null;

const formRegistry = {
  amenity: AmenityForm,
  owner: OwnerForm,
  type: TypeForm,
  neighborhood: NeighborhoodForm,
} as const;

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
  const { selected: globalSelected, setAddress, neighborhoodsList } = usePropertiesContext();

  // Estado mínimo para el modal de propiedades del dueño
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [ownerForModal, setOwnerForModal] = useState<OwnerT | null>(null);

  const openOwnerModal = (raw: any) => {
    // Normalizamos para cumplir con el tipo OwnerT (email/phone string, no undefined)
    const normalized: OwnerT = {
      id: Number(raw?.id ?? 0),
      firstName: String(raw?.firstName ?? ""),
      lastName: String(raw?.lastName ?? ""),
      email: String(raw?.email ?? ""),
      phone: String(raw?.phone ?? ""),
    };
    setOwnerForModal(normalized);
    setOwnerModalOpen(true);
  };
  const closeOwnerModal = () => {
    setOwnerModalOpen(false);
    setOwnerForModal(null);
  };

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
        // Sin filtro, devolver todos los datos
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

  // Columna de acciones + botón extra SOLO para dueños
  columns.push({
    field: "actions",
    headerName: "Acciones",
    width: 140,
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
          {category === "owner" && (
            <IconButton size="small" title="Ver propiedades" onClick={() => openOwnerModal(item)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      );
    },
  });

  // Modal CRUD (crear/editar/eliminar)
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

      {/* AddressSelector para barrios - solo se muestra si hay un barrio seleccionado */}
      {category === "neighborhood" && globalSelected.neighborhood && (
        <Box sx={{ mt: 3 }}>
          <AddressSelector
            neighborhoodId={globalSelected.neighborhood}
            neighborhoodName={neighborhoodsList.find((n) => n.id === globalSelected.neighborhood)?.name ?? ""}
            value={globalSelected.address}
            onChange={(address) => {
              setAddress({
                street: address.street,
                number: address.number,
                latitude: address.latitude ?? null,
                longitude: address.longitude ?? null,
              });
            }}
          />
        </Box>
      )}

      {/* Modal CRUD existente */}
      <ModalItem info={modal} close={() => setModal(null)} />

      {/* Modal de propiedades del dueño */}
      <OwnerPropertiesModal open={ownerModalOpen} onClose={closeOwnerModal} owner={ownerForModal} />
    </>
  );
};
