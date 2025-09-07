import { useState, ChangeEvent, FormEvent, useCallback } from "react";
import { useAuthContext } from "../../user/context/AuthContext";
import { postInquiry } from "../services/inquiry.service";
import { useApiErrors } from "../../shared/hooks/useErrors";

type InquiryFormFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  description: string;
};

interface Props {
  propertyIds?: number[];
}

export const useInquiryForm = ({ propertyIds }: Props = {}) => {
  const { info, isLogged } = useAuthContext();
  const { handleError } = useApiErrors();

  const [form, setForm] = useState<InquiryFormFields>({
    firstName: info?.firstName ?? "",
    lastName: info?.lastName ?? "",
    email: info?.email ?? "",
    phone: info?.phone ?? "",
    description: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

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
        description: form.description,
        ...(count > 0 ? { propertyIds } : {}),
      };

      try {
        if (isLogged && info) {
          await postInquiry({ userId: info.id, ...payloadBase });
        } else {
          await postInquiry({
            ...payloadBase,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
          });
        }
        setSubmitted(true);
      } catch (err) {
        // handleError muestra el toast y devuelve el string
        handleError(err);
      } finally {
        setFormLoading(false);
      }
    },
    [form, isLogged, info, propertyIds, handleError]
  );

  return {
    form,
    formLoading,
    submitted,
    handleChange,
    handleSubmit,
  };
};