import { useState, ChangeEvent, FormEvent, useCallback } from "react";
import { useAuthContext } from "../../user/context/AuthContext";
import { postInquiry } from "../services/inquiry.service";

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

  const [form, setForm] = useState<InquiryFormFields>({
    firstName: info?.firstName ?? "",
    lastName: info?.lastName ?? "",
    email: info?.email ?? "",
    phone: info?.phone ?? "",
    description: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((f) => ({ ...f, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setFormLoading(true);
      setFormError(null);

      const title = `Consulta${
        isLogged && info?.email ? ` (${info.email})` : ""
      }`;
      const payloadBase: {
        title: string;
        description: string;
        propertyIds?: number[];
      } = {
        title,
        description: form.description,
        ...(propertyIds && propertyIds.length ? { propertyIds } : {}),
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
      } catch (err: any) {
        setFormError(err.response?.data || err.message || "Error al enviar");
      } finally {
        setFormLoading(false);
      }
    },
    [form, isLogged, info, propertyIds]
  );

  return {
    form,
    formLoading,
    formError,
    submitted,
    handleChange,
    handleSubmit,
  };
};
