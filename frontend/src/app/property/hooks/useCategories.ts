import { useState } from "react";
import { useGlobalAlert } from "../../shared/context/AlertContext";
import { useLoading } from "../utils/useLoading";

export function useCategories<T extends {}>(
  initial: T,
  action: "add" | "edit" | "delete",
  save: (payload: T) => Promise<void>,
  refresh: () => Promise<void>,
  onDone: () => void
) {
  const [form, setForm] = useState<T>(initial);
  const { showAlert } = useGlobalAlert();
  const { loading, run } = useLoading(async () => {
    try {
      if (action === "add") {
        const { id, ...formWithoutId } = form as any; 
        await save(formWithoutId);
      } else {
        await save(form);
      }
      await refresh();
      onDone();
      showAlert("Acción ejecutada con éxito", "success");
    } catch (error: any) {
      const message = error.response?.data ?? "Error desconocido";
      showAlert(message, "error");
    }
  });

  const invalid =
    action !== "delete" &&
    Object.values(form).some((v) => typeof v === "string" && v.trim() === "");

  return { form, setForm, invalid, run, loading };
}
