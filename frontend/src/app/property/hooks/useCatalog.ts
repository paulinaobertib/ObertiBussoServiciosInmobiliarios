import { useNavigate } from "react-router-dom";
import { usePropertiesContext } from "../context/PropertiesContext";
import { deleteProperty } from "../services/property.service";
import { useGlobalAlert } from "../../shared/context/AlertContext";
import { useConfirmDialog } from "../../shared/components/ConfirmDialog";
import { Property } from "../types/property";
import { buildRoute, ROUTES } from "../../../lib";
import { useAuthContext } from "../../user/context/AuthContext";
import { useApiErrors } from "../../shared/hooks/useErrors";

interface Props {
  onFinish: () => void;
  externalProperties?: Property[];
}

export const useCatalog = ({ onFinish, externalProperties }: Props) => {
  const navigate = useNavigate();
  const { showAlert } = useGlobalAlert();
  const { ask, DialogUI } = useConfirmDialog();
  const { handleError } = useApiErrors();

  const { propertiesList, refreshProperties, selectedPropertyIds, toggleCompare } = usePropertiesContext();

  const { isAdmin } = useAuthContext();

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
        try {
          await deleteProperty(prop);
          showAlert("Propiedad eliminada con éxito!", "success");
          try {
            await refreshProperties();
          } catch (e) {
            // si falla el refresh, también mostramos el error
            handleError(e);
          }
        } catch (e) {
          handleError(e); // muestra el mensaje que venga del backend
        } finally {
          onFinish();
        }
      });
      return;
    }

    navigate(buildRoute(ROUTES.PROPERTY_DETAILS, prop.id));
    onFinish();
  };

  return {
    propertiesList: list,
    refresh: refreshProperties,
    selectedPropertyIds,
    toggleCompare,
    handleClick,
    DialogUI,
    isAdmin,
  };
};