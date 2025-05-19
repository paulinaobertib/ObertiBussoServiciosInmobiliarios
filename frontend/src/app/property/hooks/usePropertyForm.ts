import { useState, useMemo } from "react";
import {
  Property,
  emptyProperty,
  PropertyCreate,
  PropertyUpdate,
} from "../types/property";

export function usePropertyForm() {
  const [form, setForm] = useState<Property>(emptyProperty);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setField = <K extends keyof Property>(k: K, v: Property[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const reset = () => {
    setForm(emptyProperty);
    setFieldErrors({});
  };

  const check = useMemo(() => {
    const f = form;
    return (
      !!f.title &&
      !!f.street &&
      !!f.number &&
      f.area > 0 &&
      f.price > 0 &&
      !!f.description &&
      !!f.status &&
      !!f.operation &&
      !!f.currency &&
      f.owner.id > 0 &&
      f.neighborhood.id > 0 &&
      f.type.id > 0 &&
      !!f.mainImage
    );
  }, [form]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title) errs.title = "Campo obligatorio";
    if (!form.street) errs.street = "Campo obligatorio";
    if (!form.number) errs.number = "Campo obligatorio";
    if (form.area <= 0) errs.area = "Debe ser > 0";
    if (form.price <= 0) errs.price = "Debe ser > 0";
    if (!form.description) errs.description = "Campo obligatorio";
    if (!form.status) errs.status = "Campo obligatorio";
    if (!form.operation) errs.operation = "Campo obligatorio";
    if (!form.currency) errs.currency = "Campo obligatorio";
    if (form.owner.id <= 0) errs.owner = "Selecciona un propietario";
    if (form.neighborhood.id <= 0) errs.neighborhood = "Selecciona un barrio";
    if (form.type.id <= 0) errs.type = "Selecciona un tipo";
    if (!form.mainImage) errs.mainImage = "Carga la imagen principal";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => validate();

  const getCreateData = (): PropertyCreate => {
    const { owner, neighborhood, type, amenities, ...rest } = form;
    return {
      ...rest,
      ownerId: owner.id,
      neighborhoodId: neighborhood.id,
      typeId: type.id,
      amenitiesIds: amenities.map((a) => a.id),
      mainImage: form.mainImage,
      images: form.images,
    };
  };

  const getUpdateData = (): PropertyUpdate => {
    const { id, owner, neighborhood, type, amenities, mainImage, ...rest } =
      form;
    return {
      id,
      ...rest,
      ownerId: owner.id,
      neighborhoodId: neighborhood.id,
      typeId: type.id,
      amenitiesIds: amenities.map((a) => a.id),
      mainImage,
    };
  };

  return {
    form,
    setField,
    reset,
    submit,
    fieldErrors,
    check,
    getCreateData,
    getUpdateData,
  };
}