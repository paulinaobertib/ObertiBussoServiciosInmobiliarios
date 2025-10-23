import { useNavigate } from "react-router-dom";
import { usePropertiesContext } from "../context/PropertiesContext";
import { deleteProperty } from "../services/property.service";
import { useGlobalAlert } from "../../shared/context/AlertContext";
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
  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  const { propertiesList, refreshProperties, selectedPropertyIds, toggleCompare, propertiesLoading } =
    usePropertiesContext();
  const { isAdmin } = useAuthContext();

  const refreshMode = isAdmin ? "all" : "available";
  const list = externalProperties ?? propertiesList ?? [];

  /* --------------------------------------------------------------------- */
  /* --------------------------   HANDLERS UI   --------------------------- */
  /* --------------------------------------------------------------------- */
  const handleClick = async (mode: "normal" | "edit" | "delete", prop: Property) => {
    if (mode === "edit") {
      navigate(buildRoute(ROUTES.EDIT_PROPERTY, prop.id));
      onFinish();
      return;
    }

    if (mode === "delete") {
      const label = prop?.title ?? `propiedad #${prop?.id ?? ""}`;

      let ok = true;
      if (typeof alertApi?.doubleConfirm === "function") {
        ok = await alertApi.doubleConfirm({
          kind: "error",
          description: `¿Vas a eliminar "${label}"?`,
        });
      }
      if (!ok) {
        onFinish();
        return;
      }

      try {
        await deleteProperty(prop);

        if (typeof alertApi?.success === "function") {
          await alertApi.success({
            title: "Propiedad eliminada",
            description: `"${label}" se eliminó correctamente.`,
            primaryLabel: "Volver",
          });
        }

        try {
          await refreshProperties(refreshMode);
        } catch (e) {
          // si falla el refresh, también mostramos el error
          handleError(e);
        }
      } catch (e) {
        handleError(e); // muestra el mensaje que venga del backend
      } finally {
        onFinish();
      }
      return;
    }

    navigate(buildRoute(ROUTES.PROPERTY_DETAILS, prop.id));
    onFinish();
  };

  return {
    propertiesList: list,
    refresh: (mode?: "all" | "available") => refreshProperties(mode ?? refreshMode),
    selectedPropertyIds,
    toggleCompare,
    handleClick,
    isAdmin,
    isLoading: propertiesLoading,
  };
};
