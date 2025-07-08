import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { usePropertyCrud, Category } from "../../context/PropertiesContext";
import { translate } from "../../utils/translate";
import { ModalItem, Info } from "../ModalItem";
import { SearchBar } from "../../../shared/components/SearchBar";
import { Owner } from "../../types/owner";
import { useConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { useGlobalAlert } from "../../../shared/context/AlertContext";

// Forms
import { AmenityForm } from "./AmenityForm";
import { OwnerForm } from "./OwnerForm";
import { TypeForm } from "./TypeForm";
import { NeighborhoodForm } from "./NeighborhoodForm";
import { StatusForm } from "../properties/StatusForm";
import { getAllOwners, getOwnersByText } from "../../services/owner.service";

const formRegistry = {
  amenity: AmenityForm,
  owner: OwnerForm,
  type: TypeForm,
  neighborhood: NeighborhoodForm,
  status: StatusForm,
} as const;

interface Props {
  category: Category;
}

export const CategoryPanel = ({ category }: Props) => {
  const theme = useTheme();
  const { pickItem, data: rawData, loading, selected, toggleSelect } = usePropertyCrud();
  const { DialogUI } = useConfirmDialog();
  useGlobalAlert();

  const [modal, setModal] = useState<Info | null>(null);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);

  useEffect(() => {
    pickItem("category", category);
  }, [category]);

  // datos según categoría
  const data = category === "owner" ? filteredOwners : rawData || [];

  useEffect(() => {
    if (category === "owner") {
      setFilteredOwners((rawData as Owner[]) || []);
    }
  }, [rawData, category]);

  const isSelected = (id: number) => {
    if (category === "amenity") return selected.amenities.includes(id);
    if (category === "owner") return selected.owner === id;
    if (category === "neighborhood") return selected.neighborhood === id;
    if (category === "type") return selected.type === id;
    return false;
  };

  const categoryFields: Record<Category, { label: string; key: string }[]> = {
    owner: [
      { label: "Nombre Completo", key: "fullName" },
      { label: "Email", key: "email" },
      { label: "Teléfono", key: "phone" },
    ],
    neighborhood: [
      { label: "Nombre", key: "name" },
      { label: "Ciudad", key: "city" },
      { label: "Tipo de Barrio", key: "type" },
    ],
    type: [
      { label: "Nombre", key: "name" },
      { label: "Ambientes", key: "hasRooms" },
      { label: "Habitaciones", key: "hasBedrooms" },
      { label: "Baños", key: "hasBathrooms" },
      { label: "Área Cubierta", key: "hasCoveredArea" },
    ],
    amenity: [{ label: "Nombre", key: "name" }],
  };
  const columns = categoryFields[category];
  const gridTemplate = `${columns.map(() => "1fr").join(" ")} 75px`;

  return (
    <>
      {/* top bar: buscador (solo owner) + “+” alineados a la derecha */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {category === "owner" && (
          <Box sx={{ mr: 1, width: { xs: "12rem", sm: "20rem" } }}>
            <SearchBar
              fetchAll={getAllOwners}
              fetchByText={getOwnersByText}
              onSearch={(res) => setFilteredOwners(res as Owner[])}
              placeholder="Buscar propietario"
              debounceMs={400}
            />
          </Box>
        )}
        <IconButton
          onClick={() =>
            setModal({
              title: `Crear ${translate(category)}`,
              Component: formRegistry[category],
              componentProps: { action: "add" as const },
            })
          }
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* headers desktop */}
      <Box
        sx={{
          display: { xs: "none", sm: "grid" },
          gridTemplateColumns: gridTemplate,
          px: 2,
          py: 1,
        }}
      >
        {columns.map((col) => (
          <Typography key={col.key} fontWeight={700}>
            {col.label}
          </Typography>
        ))}
        <Typography align="right" fontWeight={700}>
          Acciones
        </Typography>
      </Box>

      {/* filas */}
      <Box sx={{ px: 2, flexGrow: 1, overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : data.length ? (
          data.map((it: any) => {
            // construye item
            const item =
              category === "owner"
                ? { ...(it as Owner), fullName: `${it.firstName} ${it.lastName}`.trim() }
                : it;
            const sel = isSelected(it.id);

            return (
              <Box
                key={it.id}
                onClick={() => toggleSelect(it.id)}
                sx={{
                  display: { xs: "block", sm: "grid" },
                  gridTemplateColumns: gridTemplate,
                  alignItems: "center",
                  py: 1,
                  mb: 0.5,
                  bgcolor: sel ? theme.palette.action.selected : "transparent",
                  cursor: "pointer",
                  "&:hover": { bgcolor: theme.palette.action.hover },
                }}
              >
                {/* mobile: etiqueta + valor */}
                <Box sx={{ display: { xs: "block", sm: "none" } }}>
                  {columns.map((col) => {
                    const raw = (item as any)[col.key];
                    const val =
                      typeof raw === "boolean"
                        ? raw
                          ? "Sí"
                          : "No"
                        : raw ?? "—";
                    return (
                      <Box key={col.key} sx={{ display: "flex", gap: 1, mb: 0.5 }}>
                        <Typography fontWeight={600}>{col.label}:</Typography>
                        <Typography>{val}</Typography>
                      </Box>
                    );
                  })}
                </Box>

                {/* desktop: solo valores */}
                {columns.map((col) => {
                  const raw = (item as any)[col.key];
                  const val =
                    typeof raw === "boolean"
                      ? raw
                        ? "Sí"
                        : "No"
                      : raw ?? "—";
                  return (
                    <Typography key={col.key} sx={{ display: { xs: "none", sm: "block" } }}>
                      {val}
                    </Typography>
                  );
                })}

                {/* acciones */}
                <Box
                  onClick={(e) => e.stopPropagation()}
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <IconButton
                    size="small"
                    onClick={() =>
                      setModal({
                        title: `Editar ${translate(category)}`,
                        Component: formRegistry[category],
                        componentProps: { action: "edit" as const, item: it },
                      })
                    }
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setModal({
                        title: `Eliminar ${translate(category)}`,
                        Component: formRegistry[category],
                        componentProps: { action: "delete" as const, item: it },
                      })
                    }
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            );
          })
        ) : (
          <Typography sx={{ mt: 2 }}>No hay datos disponibles.</Typography>
        )}
      </Box>

      <ModalItem info={modal} close={() => setModal(null)} />
      {DialogUI}
    </>
  );
};
