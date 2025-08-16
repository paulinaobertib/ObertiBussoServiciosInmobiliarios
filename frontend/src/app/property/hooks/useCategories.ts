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
  const { showAlert } = useGlobalAlert();
  const { handleError } = useApiErrors();

  const { loading, run } = useLoading(async () => {
    try {
      // En "add" ignoramos id si vino en initial
      if (action === "add") {
        const { id, ...formWithoutId } = (form as any) ?? {};
        await save(formWithoutId as T);
      } else {
        await save(form);
      }

      try {
        await refresh();
      } catch (e) {
        // Si el refresh falla, mostramos el error pero no “rompemos” el save exitoso
        handleError(e);
      }

      onDone();
      showAlert("Acción ejecutada con éxito", "success");
    } catch (e) {
      handleError(e);
    }
  });

  const invalid = action !== "delete" && Object.values(form).some((v) => typeof v === "string" && v.trim() === "");

  return { form, setForm, invalid, run, loading };
};
