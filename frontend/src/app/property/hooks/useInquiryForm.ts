import { useState, ChangeEvent, FormEvent, useCallback } from "react";
import { useAuthContext } from "../../user/context/AuthContext";
import { postInquiry } from "../services/inquiry.service";
import { useApiErrors } from "../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../shared/context/AlertContext";

type InquiryFormFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  description: string;
};

interface Props {
  propertyIds?: number[];
  /** Personalizar el modal de éxito (opcional) */
  successTitle?: string;
  successDescription?: string;
}

export const useInquiryForm = ({ propertyIds, successTitle, successDescription }: Props = {}) => {
  const { info, isLogged } = useAuthContext();
  const { handleError } = useApiErrors();
  const alertApi: any = useGlobalAlert();

  const makeInitial = (): InquiryFormFields => ({
    firstName: info?.firstName ?? "",
    lastName: info?.lastName ?? "",
    email: info?.email ?? "",
    phone: info?.phone ?? "",
    description: "",
  });

  const [form, setForm] = useState<InquiryFormFields>(makeInitial());
  const [formLoading, setFormLoading] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({
          title,
          description,
          primaryLabel: "Cerrar",
        });
      } else if (typeof alertApi?.showAlert === "function") {
        alertApi.showAlert(description ?? title, "success");
      }
    },
    [alertApi]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setFormLoading(true);

      const count = propertyIds?.length ?? 0;
      const title = count === 0 ? "Consulta General" : count === 1 ? "Consulta Individual" : "Consulta Grupal";

      const payloadBase: {
        title: string;
        description: string;
        propertyIds?: number[];
      } = {
        title,
        description: form.description?.trim(),
        ...(count > 0 ? { propertyIds } : {}),
      };

      try {
        if (isLogged && info) {
          await postInquiry({ userId: info.id, ...payloadBase });
        } else {
          await postInquiry({
            ...payloadBase,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
          });
        }

        await notifySuccess(
          successTitle ?? "Consulta enviada",
          successDescription ?? "Gracias por contactarte. Te responderemos a la brevedad."
        );

        // ✅ siempre resetea el formulario
        setForm(makeInitial());
      } catch (err) {
        handleError(err);
      } finally {
        setFormLoading(false);
      }
    },
    [form, isLogged, info, propertyIds, notifySuccess, handleError]
  );

  return {
    form,
    formLoading,
    handleChange,
    handleSubmit,
    reset: () => setForm(makeInitial()),
  };
};
