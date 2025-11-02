import { useState, ChangeEvent, FormEvent, useCallback } from "react";
import { postSuggestion } from "../services/suggestion.service";
import { SuggestionCreate } from "../types/suggestion";
import { useApiErrors } from "../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../shared/context/AlertContext";

interface Props {
  onSuccess?: () => void;
}

export const useSuggestionForm = ({ onSuccess }: Props = {}) => {
  const { handleError } = useApiErrors();
  const alertApi: any = useGlobalAlert();

  const [form, setForm] = useState<SuggestionCreate>({
    description: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await postSuggestion(form);

      // Resetear formulario
      setForm({ description: "" });

      // Cerrar modal si se proporciona la función
      if (onSuccess) {
        onSuccess();
      }

      // Mostrar mensaje de éxito
      if (typeof alertApi?.success === "function") {
        await alertApi.success({
          title: "¡Sugerencia enviada!",
          description: "Gracias por tu sugerencia. La revisaremos a la brevedad.",
          primaryLabel: "Cerrar",
        });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setFormLoading(false);
    }
  };

  return {
    form,
    formLoading,
    handleChange,
    handleSubmit,
  };
};
