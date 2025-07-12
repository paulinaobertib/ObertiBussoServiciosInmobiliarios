import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePropertiesContext } from "../context/PropertiesContext";
import { deleteProperty } from "../services/property.service";
import { useGlobalAlert } from "../../shared/context/AlertContext";
import { useConfirmDialog } from "../../shared/components/ConfirmDialog";
import { Property } from "../types/property";
import { buildRoute, ROUTES } from "../../../lib";
import { useAuthContext } from "../../user/context/AuthContext";

export function useCatalog(onFinish: () => void) {
  const navigate = useNavigate();
  const { showAlert } = useGlobalAlert();
  const { ask, DialogUI } = useConfirmDialog();
  const {
    propertiesList,
    loading,
    refreshProperties,
    selectedPropertyIds,
    toggleCompare,
  } = usePropertiesContext();
  const { isAdmin } = useAuthContext();

  //
  // ———————— Selección & Comparación ————————
  //
  const [selectionMode, setSelectionMode] = useState(false);
  const [compareCount, setCompareCount] = useState(0);

  // Llamarás toggleSelectionMode() desde el FloatingButtons
  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      // si salís de modo selección, resetea conteo
      if (prev) setCompareCount(0);
      return !prev;
    });
  };

  // Al marcar/desmarcar una propiedad en la lista, invoca esta función:
  const onToggleCompare = (add: boolean) => {
    setCompareCount((c) => (add ? c + 1 : c - 1));
  };

  const onCompare = () => {
    // aquí haces la navegación o lógica de comparar
  };

  //
  // ———————— CRUD & Navegación ————————
  //
  const handleClick = (mode: "normal" | "edit" | "delete", prop: Property) => {
    if (mode === "edit") {
      navigate(buildRoute(ROUTES.EDIT_PROPERTY, prop.id));
      onFinish();
    } else if (mode === "delete") {
      ask(`¿Eliminar "${prop.title}"?`, async () => {
        await deleteProperty(prop);
        showAlert("Propiedad eliminada con éxito!", "success");
        await refreshProperties();
        onFinish();
      });
    } else {
      navigate(buildRoute(ROUTES.PROPERTY_DETAILS, prop.id));
      onFinish();
    }
  };

  return {
    // datos
    propertiesList,
    loading,
    refresh: refreshProperties,
    selectedPropertyIds,
    toggleCompare,

    // selección/comparación
    selectionMode,
    toggleSelectionMode,
    compareCount,
    onToggleCompare,
    onCompare,

    // CRUD
    handleClick,
    DialogUI,

    // rol
    isAdmin,
  };
}
