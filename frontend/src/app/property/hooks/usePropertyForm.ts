import { useState, useMemo, useEffect, useCallback } from "react";

import { usePropertiesContext } from "../context/PropertiesContext";
import { useImages } from "../../shared/hooks/useImages";

import type {
  Property,
  PropertyCreate,
  PropertyUpdate,
} from "../types/property";
import { Owner } from "../types/owner";
import { Neighborhood } from "../types/neighborhood";
import { Type } from "../types/type";

function makeSafeProperty(raw?: Partial<Property>): Property {
  const now = new Date().toISOString();

  const emptyOwner: Owner = {
    id: 0,
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  };
  const emptyNeighborhood: Neighborhood = {
    id: 0,
    name: "",
    city: "",
    type: "",
  };
  const emptyType: Type = {
    id: 0,
    name: "",
    hasRooms: false,
    hasBedrooms: false,
    hasBathrooms: false,
    hasCoveredArea: false,
  };

  return {
    /* ---------- primitivos ---------- */
    id: raw?.id ?? 0,
    title: raw?.title ?? "",
    description: raw?.description ?? "",
    price: raw?.price ?? 0,
    area: raw?.area ?? 0,
    coveredArea: raw?.coveredArea ?? 0,
    expenses: raw?.expenses ?? null,
    currency: raw?.currency ?? "",
    operation: raw?.operation ?? "",
    status: raw?.status ?? "",
    rooms: raw?.rooms ?? 0,
    bedrooms: raw?.bedrooms ?? 0,
    bathrooms: raw?.bathrooms ?? 0,
    credit: raw?.credit ?? false,
    financing: raw?.financing ?? false,
    showPrice: raw?.showPrice ?? false,

    street: raw?.street ?? "",
    number: raw?.number ?? "",
    outstanding: raw?.outstanding ?? false,

    /* ---------- relaciones ---------- */
    owner: raw?.owner ?? emptyOwner,
    neighborhood: raw?.neighborhood ?? emptyNeighborhood,
    type: raw?.type ?? emptyType,
    amenities: raw?.amenities ?? [],

    /* ---------- imágenes ---------- */
    mainImage: raw?.mainImage ?? "",
    images: raw?.images ?? [],

    date: raw?.date ?? now,
  };
}

/* ------------------------------------------------------------------ */
/* HOOK UNIFICADO */
/* ------------------------------------------------------------------ */
export const usePropertyForm = (
  initialData?: Property,
  onImageSelect?: (
    main: string | File | null,
    gallery: (string | File)[]
  ) => void,
  onValidityChange?: (valid: boolean) => void
) => {
  /* ---------- estado base ---------- */
  const [form, setForm] = useState<Property>(makeSafeProperty(initialData));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /* evita asignar undefined/null en claves críticas */
  const setField = <K extends keyof Property>(k: K, v: Property[K]) => {
    if (
      (k === "owner" || k === "neighborhood" || k === "type") &&
      (v as unknown) == null
    ) {
      return; // ignora nulos/undefined
    }
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const reset = () => {
    setForm(makeSafeProperty());
    setFieldErrors({});
  };

  /* ---------- imágenes ---------- */
  const {
    mainImage,
    gallery,
    error: imgError,
    clearError,
    setMain,
    addToGallery,
    remove,
  } = useImages(initialData?.mainImage ?? null, initialData?.images ?? []);

  /* propaga imágenes al form + callback padre */
  useEffect(() => {
    setField("mainImage", mainImage as any);
    setField("images", gallery as any);
    onImageSelect?.(mainImage, gallery);
  }, [mainImage, gallery]);

  /* ---------- catálogos / selección ---------- */
  const { selected, ownersList, neighborhoodsList, typesList, amenitiesList } =
    usePropertiesContext();

  /* sincs selects */
  useEffect(() => {
    const o = ownersList.find((o) => o.id === selected.owner);
    if (o && form.owner.id !== o.id) setField("owner", o);
  }, [selected.owner, ownersList]);

  useEffect(() => {
    const n = neighborhoodsList.find((n) => n.id === selected.neighborhood);
    if (n && form.neighborhood.id !== n.id) setField("neighborhood", n);
  }, [selected.neighborhood, neighborhoodsList]);

  useEffect(() => {
    const t = typesList.find((t) => t.id === selected.type);
    if (t && form.type.id !== t.id) setField("type", t);
  }, [selected.type, typesList]);

  useEffect(() => {
    const a = amenitiesList.filter((a) => selected.amenities.includes(a.id));
    if (
      JSON.stringify(a.map((x) => x.id)) !==
      JSON.stringify(form.amenities.map((x) => x.id))
    ) {
      setField("amenities", a);
    }
  }, [selected.amenities, amenitiesList]);

  /* ---------- flags dinámicos por tipo ---------- */
  const currentType = typesList.find((t) => t.id === form.type.id);
  const showRooms = currentType?.hasRooms ?? false;
  const showBedrooms = currentType?.hasBedrooms ?? false;
  const showBathrooms = currentType?.hasBathrooms ?? false;
  const showCoveredArea = currentType?.hasCoveredArea ?? false;
  const visibleRoomFields = [showRooms, showBedrooms, showBathrooms].filter(
    Boolean
  ).length;
  const colSize =
    visibleRoomFields === 1 ? 12 : visibleRoomFields === 2 ? 6 : 4;

  /* limpiar campos ocultos */
  useEffect(() => {
    if (!showRooms && form.rooms !== 0) setField("rooms", 0 as any);
    if (!showBedrooms && form.bedrooms !== 0) setField("bedrooms", 0 as any);
    if (!showBathrooms && form.bathrooms !== 0) setField("bathrooms", 0 as any);
    if (!showCoveredArea && form.coveredArea !== 0)
      setField("coveredArea", 0 as any);
  }, [
    showRooms,
    showBedrooms,
    showBathrooms,
    showCoveredArea,
    form.rooms,
    form.bedrooms,
    form.bathrooms,
    form.coveredArea,
  ]);

  /* reset credit/financing si operación → ALQUILER */
  useEffect(() => {
    if (form.operation === "ALQUILER" && (form.credit || form.financing)) {
      setField("credit", false);
      setField("financing", false);
    }
  }, [form.operation]);

  /* ---------- helper num() ---------- */
  const num = useCallback(
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "") return setField(k, "" as any);
      const n = parseInt(val, 10);
      if (!isNaN(n)) setField(k, n as any);
    },
    [setField]
  );

  /* ---------- validación rápida (check) ---------- */
  const check = useMemo(() => {
    const f = form;

    // validación base (siempre visibles)
    const baseValid =
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
      !!f.mainImage &&
      (form.expenses ?? 0) >= 0;

    // validación de campos dinámicos: sólo si están visibles, deben ser >0
    const dynamicValid =
      (!showRooms || f.rooms > 0) &&
      (!showBedrooms || f.bedrooms > 0) &&
      (!showBathrooms || f.bathrooms > 0) &&
      (!showCoveredArea || f.coveredArea > 0);

    return baseValid && dynamicValid;
  }, [form, showRooms, showBedrooms, showBathrooms, showCoveredArea]);

  /* notificar validez al padre */
  useEffect(() => onValidityChange?.(check), [check]);

  /* ---------- validación exhaustiva + submit ---------- */
  const validate = () => {
    const e: Record<string, string> = {};

    // Validaciones siempre visibles
    if (!form.title) e.title = "Campo obligatorio";
    if (!form.street) e.street = "Campo obligatorio";
    if (!form.number) e.number = "Campo obligatorio";
    if (form.area <= 0) e.area = "Debe ser > 0";
    if (form.price <= 0) e.price = "Debe ser > 0";
    if (!form.description) e.description = "Campo obligatorio";
    if (!form.status) e.status = "Campo obligatorio";
    if (!form.operation) e.operation = "Campo obligatorio";
    if (!form.currency) e.currency = "Campo obligatorio";
    if ((form.owner?.id ?? 0) <= 0) e.owner = "Selecciona un propietario";
    if ((form.neighborhood?.id ?? 0) <= 0)
      e.neighborhood = "Selecciona un barrio";
    if ((form.type?.id ?? 0) <= 0) e.type = "Selecciona un tipo";
    if (!form.mainImage) e.mainImage = "Carga la imagen principal";

    // Expensas: debe existir (>= 0)
    if (form.expenses == null || form.expenses < 0) {
      e.expenses = "Campo obligatorio";
    }
    // Campos dinámicos: sólo validar si están visibles
    if (showRooms && form.rooms <= 0) {
      e.rooms = "Debe ser > 0";
    }
    if (showBedrooms && form.bedrooms <= 0) {
      e.bedrooms = "Debe ser > 0";
    }
    if (showBathrooms && form.bathrooms <= 0) {
      e.bathrooms = "Debe ser > 0";
    }
    if (showCoveredArea && form.coveredArea <= 0) {
      e.coveredArea = "Debe ser > 0";
    }

    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => validate();

  /* ---------- DTO helpers ---------- */
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
    const { id, owner, neighborhood, type, amenities, ...rest } = form;
    return {
      id,
      ...rest,
      ownerId: owner.id,
      neighborhoodId: neighborhood.id,
      typeId: type.id,
      amenitiesIds: amenities.map((a) => a.id),
      mainImage: form.mainImage,
    };
  };

  /* ---------- API ---------- */
  return {
    /* estado + errores */
    form,
    fieldErrors,

    /* visibilidad dinámica */
    showRooms,
    showBedrooms,
    showBathrooms,
    showCoveredArea,
    colSize,

    /* helpers */
    num,

    /* imágenes */
    mainImage,
    gallery,
    imgError,
    clearError,
    setMain,
    addToGallery,
    remove,

    /* acciones */
    submit,
    reset,
    setField,
    getCreateData,
    getUpdateData,
    check,
  };
};
