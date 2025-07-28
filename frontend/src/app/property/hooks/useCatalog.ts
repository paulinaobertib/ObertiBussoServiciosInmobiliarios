// src/app/property/hooks/useCatalog.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePropertiesContext } from "../context/PropertiesContext";
import { deleteProperty } from "../services/property.service";
import { useGlobalAlert } from "../../shared/context/AlertContext";
import { useConfirmDialog } from "../../shared/components/ConfirmDialog";
import { Property } from "../types/property";
import { buildRoute, ROUTES } from "../../../lib";
import { useAuthContext } from "../../user/context/AuthContext";

export function useCatalog(
  onFinish: () => void,
  externalProperties?: Property[]
) {
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

  useEffect(() => {
    if (propertiesList === null) refreshProperties();
  }, [propertiesList, refreshProperties]);

  const list = externalProperties ?? propertiesList ?? [];

  /* --------------------------------------------------------------------- */
  /* --------------------------   HANDLERS UI   --------------------------- */
  /* --------------------------------------------------------------------- */
  const handleClick = (mode: "normal" | "edit" | "delete", prop: Property) => {
    if (mode === "edit") {
      navigate(buildRoute(ROUTES.EDIT_PROPERTY, prop.id));
      onFinish();
      return;
    }
    if (mode === "delete") {
      ask(`¿Eliminar "${prop.title}"?`, async () => {
        await deleteProperty(prop);
        showAlert("Propiedad eliminada con éxito!", "success");
        refreshProperties();
        onFinish();
      });
      return;
    }
    navigate(buildRoute(ROUTES.PROPERTY_DETAILS, prop.id));
    onFinish();
  };

  return {
    propertiesList: list,
    loading, // boolean
    refresh: refreshProperties,
    selectedPropertyIds,
    toggleCompare,
    handleClick,
    DialogUI,
    isAdmin,
  };
}
