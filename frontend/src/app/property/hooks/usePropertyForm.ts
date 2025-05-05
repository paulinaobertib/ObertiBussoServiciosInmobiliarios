import { useState } from "react";
import { PropertyCreate } from "../types/property";
import { postProperty } from "../services/property.service";

/* ----- estado inicial vacío ----- */
export const empty: PropertyCreate = {
  title: "",
  street: "",
  number: "",
  rooms: 0,
  bathrooms: 0,
  bedrooms: 0,
  area: 0,
  price: 0,
  description: "",
  status: "",
  operation: "",
  currency: "",
  ownerId: 0,
  neighborhoodId: 0,
  typeId: 0,
  amenitiesIds: [],
  mainImage: null,
  images: [],
};

export function usePropertyForm() {
  const [form, setForm] = useState<PropertyCreate>(empty);
  // const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /* -------- helpers -------- */
  const setField = <K extends keyof PropertyCreate>(
    k: K,
    v: PropertyCreate[K]
  ) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const reset = () => {
    setForm(empty);
  };

  const submit = async (): Promise<boolean> => {
    if (!validate()) return false;
    // setLoading(true);

    try {
      await postProperty(form);
      setSuccess(true);
      reset();
      return true;
    } catch {
      return false;
    } finally {
      // setLoading(false);
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!form.title) errors.title = "Campo obligatorio";
    if (!form.street) errors.street = "Campo obligatorio";
    if (!form.number) errors.number = "Campo obligatorio";
    if (form.rooms < 0) errors.rooms = "Debe ser mayor a 0";
    if (form.bathrooms < 0) errors.bathrooms = "Debe ser mayor a 0";
    if (form.bedrooms < 0) errors.bedrooms = "Debe ser mayor a 0";
    if (form.area <= 0) errors.area = "Debe ser mayor a 0";
    if (form.price <= 0) errors.price = "Debe ser mayor a 0";
    if (!form.description) errors.description = "Campo obligatorio";
    if (!form.status) errors.status = "Campo obligatorio";
    if (!form.operation) errors.operation = "Campo obligatorio";
    if (!form.currency) errors.currency = "Campo obligatorio";
    if (form.ownerId <= 0) errors.ownerId = "Selecciona un propietario";
    if (form.neighborhoodId <= 0)
      errors.neighborhoodId = "Selecciona un barrio";
    if (form.typeId <= 0) errors.typeId = "Selecciona un tipo";
    if (!form.mainImage) errors.mainImage = "Cargá una imagen principal";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return {
    form,
    setField,
    submit,
    reset,
    // loading,
    success,
    fieldErrors,
  };
}
