import { useState, useEffect, useCallback } from "react";

import { usePropertiesContext } from "../context/PropertiesContext";
import type { Property } from "../types/property";
import { useApiErrors } from "../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../shared/context/AlertContext";
import { deleteProperty as svcDeleteProperty } from "../services/property.service";

export const usePropertyPanel = (mode: "all" | "available" = "all") => {
  const { propertiesList, refreshProperties } = usePropertiesContext();
  const { handleError } = useApiErrors();
  const alertApi: any = useGlobalAlert();

  // datos filtrados
  const [data, setData] = useState<Property[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  // selección de fila
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // helpers de alerta
  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (alertApi?.success) {
        await alertApi.success({ title, description, primaryLabel: "Volver" });
      } else if (alertApi?.showAlert) {
        alertApi.showAlert(description ?? title, "success");
      }
    },
    [alertApi]
  );

  const confirmDanger = useCallback(
    async (title: string, description = "Esta acción no se puede deshacer.") => {
      if (alertApi?.doubleConfirm) {
        return await alertApi.doubleConfirm({
          kind: "error",
          title,
          description,
          step2Title: "¿Estás seguro?",
          step2Description: "Confirmá nuevamente para continuar.",
          primaryLabel: "Continuar",
          secondaryLabel: "Cancelar",
          swapOnSecond: true,
        });
      }
      if (alertApi?.confirm) {
        return await alertApi.confirm({
          title: "Confirmar acción",
          description: `${title}. ${description}`,
          primaryLabel: "Confirmar",
          secondaryLabel: "Cancelar",
        });
      }
      return window.confirm(`${title}\n\n${description}`);
    },
    [alertApi]
  );

  // 1) carga inicial
  useEffect(() => {
    (async () => {
      setLocalLoading(true);
      try {
        await refreshProperties(mode);
      } catch (e) {
        handleError(e);
      } finally {
        setLocalLoading(false);
      }
    })();
  }, [refreshProperties, mode, handleError]);

  // 2) cuando cambian en el contexto
  useEffect(() => {
    setData(propertiesList ?? []);
    setLocalLoading(false);
  }, [propertiesList]);

  // 3) búsqueda (SearchBar.onSearch)
  const onSearch = useCallback((results: Property[]) => {
    setData(results);
  }, []);

  // 4) selección
  const toggleSelect = useCallback((id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);
  const isSelected = useCallback((id: number) => selectedId === id, [selectedId]);

  // 5) refresh público
  const refresh = useCallback(async () => {
    setLocalLoading(true);
    try {
      await refreshProperties(mode);
    } catch (e) {
      handleError(e);
    } finally {
      setLocalLoading(false);
    }
  }, [refreshProperties, mode, handleError]);

  // 6) eliminar (doble confirmación + éxito)
  const removeProperty = useCallback(
    async (prop: Property) => {
      const label = prop?.title ?? `propiedad #${prop?.id ?? ""}`;
      const ok = await confirmDanger(`Vas a eliminar "${label}"`);
      if (!ok) return false;

      try {
        await svcDeleteProperty(prop);
        await notifySuccess("Propiedad eliminada", `"${label}" se eliminó correctamente.`);
        await refresh();
        setSelectedId((prev) => (prev === prop.id ? null : prev));
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    },
    [confirmDanger, notifySuccess, refresh, handleError]
  );

  const removeSelected = useCallback(async () => {
    if (selectedId == null) return false;
    const prop = data.find((p) => p.id === selectedId);
    if (!prop) return false;
    return await removeProperty(prop);
  }, [selectedId, data, removeProperty]);

  return {
    // lo que ya tenías
    data,
    loading: localLoading,
    onSearch,
    toggleSelect,
    isSelected,
    selectedId,
    // nuevo
    refresh,
    removeProperty,
    removeSelected,
  };
};
