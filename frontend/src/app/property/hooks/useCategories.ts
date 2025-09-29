import { useState } from "react";
import { useGlobalAlert } from "../../shared/context/AlertContext";
import { useLoading } from "../utils/useLoading";
import { useApiErrors } from "../../shared/hooks/useErrors";

interface Props<T extends {}> {
  initial: T;
  action: "add" | "edit" | "delete";
  save: (payload: T) => Promise<void>;
  refresh: () => Promise<void>;
  onDone: () => void;
}

export const useCategories = <T extends {}>({ initial, action, save, refresh, onDone }: Props<T>) => {
  const [form, setForm] = useState<T>(initial);
  const alertApi: any = useGlobalAlert(); // puede tener success/confirm/doubleConfirm o showAlert (legacy)
  const { handleError } = useApiErrors();

  // Título de éxito según acción
  const successTitle =
    action === "add" ? "Categoría creada" : action === "edit" ? "Cambios guardados" : "Categoría eliminada";

  const notifySuccess = async (title: string, description?: string) => {
    if (alertApi?.success) {
      await alertApi.success({
        title,
        description: description ?? "Acción ejecutada con éxito",
        primaryLabel: "Volver",
      });
    } else if (alertApi?.showAlert) {
      alertApi.showAlert(description ?? title, "success");
    }
  };

  const { loading, run } = useLoading(async () => {
    try {
      // ---- DOBLE CONFIRMACIÓN SÓLO PARA DELETE ----
      if (action === "delete") {
        const f: any = form ?? {};
        const label =
          f?.name ?? f?.firstName ?? f?.neighborhood ?? (typeof f?.id !== "undefined" ? `#${f.id}` : "este registro");

        let ok = true;
        if (typeof alertApi?.doubleConfirm === "function") {
          ok = await alertApi.doubleConfirm({
            kind: "error",
            description: `¿Eliminar "${String(label)}"?`,
          });
        }
        if (!ok) return; // usuario canceló
      }
      // ---------------------------------------------

      // En "add" ignoramos id si vino en initial
      if (action === "add") {
        const { id, ...formWithoutId } = (form as any) ?? {};
        await save(formWithoutId as T);
      } else {
        await save(form);
      }

      // Intentar refrescar (si falla, informar pero no romper el flujo)
      try {
        await refresh();
      } catch (e) {
        handleError(e);
      }

      onDone();
      await notifySuccess(successTitle, "Acción ejecutada con éxito");
    } catch (e) {
      handleError(e);
    }
  });

  const invalid = action !== "delete" && Object.values(form).some((v) => typeof v === "string" && v.trim() === "");

  return { form, setForm, invalid, run, loading };
};
