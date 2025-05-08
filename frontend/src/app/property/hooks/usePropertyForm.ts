import { useState, useMemo } from "react";
import { Property, PropertyCreate, PropertyUpdate } from "../types/property";

/* Estado inicial */
export const empty: Property = {
  id: 0, // en creación lo podés ignorar
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
  const [form, setForm] = useState<Property>(empty);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /* Modificar un campo */
  const setField = <K extends keyof Property>(k: K, v: Property[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  /* Reset */
  const reset = () => {
    setForm(empty);
    setFieldErrors({});
  };

  /* ---------- chequeo “en seco” para la UI ---------- */
  const check = useMemo(() => {
    const f = form;
    return (
      !!f.title &&
      !!f.street &&
      !!f.number &&
      f.rooms >= 0 &&
      f.bathrooms >= 0 &&
      f.bedrooms >= 0 &&
      f.area > 0 &&
      f.price > 0 &&
      !!f.description &&
      !!f.status &&
      !!f.operation &&
      !!f.currency &&
      f.ownerId > 0 &&
      f.neighborhoodId > 0 &&
      f.typeId > 0 &&
      !!f.mainImage
    );
  }, [form]);

  /* Validación */
  const validate = () => {
    const errors: Record<string, string> = {};

    if (!form.title) errors.title = "Campo obligatorio";
    if (!form.street) errors.street = "Campo obligatorio";
    if (!form.number) errors.number = "Campo obligatorio";
    if (form.rooms < 0) errors.rooms = "Debe ser mayor a 0";
    if (form.bathrooms < 0) errors.bathrooms = "Debe ser mayor a 0";
    if (form.bedrooms < 0) errors.bedrooms = "Debe ser mayor a 0";
    if (form.area < 0) errors.area = "Debe ser mayor a 0";
    if (form.price < 0) errors.price = "Debe ser mayor a 0";
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
    const ok = Object.keys(errors).length === 0;
    return ok;
  };

  /* Validar y devolver datos si todo está bien */
  const submit = async (): Promise<boolean> => {
    const isValid = validate();
    return isValid;
  };

  /* Obtener datos para creación */
  const getCreateData = (): PropertyCreate => {
    const { id, ...rest } = form;
    return rest;
  };

  /* Obtener datos para edición */
  const getUpdateData = (): PropertyUpdate => {
    const { mainImage, images, ...rest } = form;

    return rest as PropertyUpdate;
  };

  return {
    form,
    setField,
    reset,
    submit,
    fieldErrors,
    getCreateData,
    getUpdateData,
    check,
  };
}
