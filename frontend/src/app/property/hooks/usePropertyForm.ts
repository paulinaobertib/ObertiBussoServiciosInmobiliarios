import { useState, useMemo, useEffect, useCallback, useRef } from "react";

import { usePropertiesContext } from "../context/PropertiesContext";

import type { Property, PropertyCreate, PropertyUpdate } from "../types/property";
import { Owner } from "../types/owner";
import { Neighborhood } from "../types/neighborhood";
import { Type } from "../types/type";

/* Helpers */
type Img = string | File;
const keyOf = (img: Img) => (img instanceof File ? `${img.name}#${img.size}#${img.lastModified}` : img);

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
    outstanding: raw?.outstanding ?? false,

    street: raw?.street ?? "",
    number: raw?.number ?? "",
    latitude: raw?.latitude ?? null,
    longitude: raw?.longitude ?? null,

    /* ---------- relaciones ---------- */
    owner: raw?.owner ?? emptyOwner,
    neighborhood: raw?.neighborhood ?? emptyNeighborhood,
    type: raw?.type ?? emptyType,
    amenities: raw?.amenities ?? [],

    /* ---------- imágenes ---------- */
    // Permitimos string | File | null en runtime, pero almacenamos como any para no romper tipos existentes
    mainImage: (raw?.mainImage as any) ?? "",
    images: (raw?.images as any) ?? [],

    date: raw?.date ?? now,
  };
}

/* ------------------------------------------------------------------ */
/* HOOK UNIFICADO (sin doble estado de imágenes) */
/* ------------------------------------------------------------------ */
export const usePropertyForm = (
  initialData?: Property,
  onImageSelect?: (main: Img | null, gallery: Img[]) => void,
  onValidityChange?: (valid: boolean) => void
) => {
  /* ---------- estado base ---------- */
  const [form, setForm] = useState<Property>(makeSafeProperty(initialData));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Ref para rastrear si es la primera carga (para no limpiar campos al cargar una propiedad existente)
  const isInitialMount = useRef(true);

  /* evita asignar undefined/null en claves críticas */
  const setField = <K extends keyof Property>(k: K, v: Property[K]) => {
    if ((k === "owner" || k === "neighborhood" || k === "type") && (v as unknown) == null) {
      return; // ignora nulos/undefined
    }
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const reset = () => {
    setForm(makeSafeProperty());
    setFieldErrors({});
  };

  /* ---------- imágenes (sobre el propio form, sin useImages) ---------- */
  const setMain = useCallback((img: Img | null) => {
    setForm((prev) => {
      const galleryArr = (prev.images as any as Img[]) ?? [];
      const newMain = img ?? ("" as any);
      // si la imagen que se setea como main estaba en la galería, la removemos de allí
      const k = img ? keyOf(img) : null;
      const filtered = k == null ? galleryArr : galleryArr.filter((g) => keyOf(g) !== k);
      return { ...prev, mainImage: newMain as any, images: filtered as any };
    });
  }, []);

  const addToGallery = useCallback((items: Img[] | Img) => {
    const list = Array.isArray(items) ? items : [items];
    setForm((prev) => {
      const galleryArr = (prev.images as any as Img[]) ?? [];
      const out = new Map(galleryArr.map((g) => [keyOf(g), g]));
      const main = prev.mainImage as any as Img | null;
      const mainK = main ? keyOf(main) : null;

      for (const it of list) {
        const k = keyOf(it);
        if (k === mainK) continue; // no duplicar main en galería
        if (!out.has(k)) out.set(k, it);
      }
      return { ...prev, images: Array.from(out.values()) as any };
    });
  }, []);

  const remove = useCallback((img: Img) => {
    setForm((prev) => {
      const k = keyOf(img);
      const currMain = prev.mainImage as any as Img | null;
      const isMain = currMain && keyOf(currMain) === k;
      const galleryArr = (prev.images as any as Img[]) ?? [];
      const nextGallery = galleryArr.filter((g) => keyOf(g) !== k);
      return {
        ...prev,
        mainImage: (isMain ? ("" as any) : prev.mainImage) as any,
        images: nextGallery as any,
      };
    });
  }, []);

  // Propagar imágenes a quien lo necesite (compat con tu firma actual)
  useEffect(() => {
    onImageSelect?.((form.mainImage as any) ?? null, ((form.images as any) ?? []) as Img[]);
  }, [form.mainImage, form.images]);

  /* ---------- catálogos / selección ---------- */
  const { selected, ownersList, neighborhoodsList, typesList, amenitiesList } = usePropertiesContext();

  /* sincs selects */
  useEffect(() => {
    const o = ownersList.find((o) => o.id === selected.owner);
    if (o && form.owner.id !== o.id) setField("owner", o);
  }, [selected.owner, ownersList]);

  useEffect(() => {
    const n = neighborhoodsList.find((n) => n.id === selected.neighborhood);
    if (n && form.neighborhood.id !== n.id) {
      setField("neighborhood", n);
    }
  }, [selected.neighborhood, neighborhoodsList]);

  // Sincronizar dirección desde el contexto - solo si realmente cambió
  useEffect(() => {
    const addressChanged =
      selected.address.street !== form.street ||
      selected.address.number !== form.number ||
      selected.address.latitude !== form.latitude ||
      selected.address.longitude !== form.longitude;

    if (addressChanged) {
      setField("street", selected.address.street);
      setField("number", selected.address.number);
      setField("latitude", selected.address.latitude);
      setField("longitude", selected.address.longitude);
    }
  }, [selected.address, form.street, form.number, form.latitude, form.longitude]);

  useEffect(() => {
    const t = typesList.find((t) => t.id === selected.type);
    if (t && form.type.id !== t.id) setField("type", t);
  }, [selected.type, typesList]);

  useEffect(() => {
    const a = amenitiesList.filter((a) => selected.amenities.includes(a.id));
    if (JSON.stringify(a.map((x) => x.id)) !== JSON.stringify(form.amenities.map((x) => x.id))) {
      setField("amenities", a);
    }
  }, [selected.amenities, amenitiesList]);

  /* ---------- flags dinámicos por tipo ---------- */
  const currentType = typesList.find((t) => t.id === form.type.id);
  const showRooms = currentType?.hasRooms ?? false;
  const showBedrooms = currentType?.hasBedrooms ?? false;
  const showBathrooms = currentType?.hasBathrooms ?? false;
  const showCoveredArea = currentType?.hasCoveredArea ?? false;
  const visibleRoomFields = [showRooms, showBedrooms, showBathrooms].filter(Boolean).length;
  const colSize = visibleRoomFields === 1 ? 12 : visibleRoomFields === 2 ? 6 : 4;

  /* limpiar campos ocultos - SOLO cuando cambia el tipo, no en carga inicial */
  useEffect(() => {
    // En el primer render, marcar como ya montado y no hacer nada
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Solo limpiar si el campo no debería estar visible
    if (!showRooms && form.rooms !== 0) setField("rooms", 0 as any);
    if (!showBedrooms && form.bedrooms !== 0) setField("bedrooms", 0 as any);
    if (!showBathrooms && form.bathrooms !== 0) setField("bathrooms", 0 as any);
    if (!showCoveredArea && form.coveredArea !== 0) setField("coveredArea", 0 as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showRooms,
    showBedrooms,
    showBathrooms,
    showCoveredArea,
    // NO incluir form.rooms, form.bedrooms, etc. para evitar loops
  ]);

  /* reset credit/financing si operación → ALQUILER */
  useEffect(() => {
    if (form.operation === "ALQUILER" && (form.credit || form.financing)) {
      setField("credit", false);
      setField("financing", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.operation]);

  /* ---------- helper num() ---------- */
  const num = useCallback(
    (k: keyof typeof form, opts?: { allowNull?: boolean }) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "") {
        setField(k, (opts?.allowNull ? (null as any) : ("" as any)));
        return;
      }
      const n = parseInt(val, 10);
      if (!isNaN(n)) setField(k, n as any);
    },
    [setField]
  );

  /* ---------- validación rápida (check) ---------- */
  const check = useMemo(() => {
    const f = form;

    // validación base (siempre visibles)
    const expensesValid = form.expenses == null || form.expenses >= 0;

    // Permitir crear sin coordenadas (se pueden agregar después o dejar sin validar)
    const baseValid =
      !!f.title &&
      !!f.street &&
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
      expensesValid;

    // validación de campos dinámicos: sólo si están visibles, deben ser >0
    const dynamicValid =
      (!showRooms || f.rooms > 0) &&
      (!showBedrooms || f.bedrooms > 0) &&
      (!showBathrooms || f.bathrooms > 0) &&
      (!showCoveredArea || f.coveredArea > 0);

    return baseValid && dynamicValid;
  }, [form, showRooms, showBedrooms, showBathrooms, showCoveredArea]);

  /* notificar validez al padre */
  useEffect(() => onValidityChange?.(check), [check, onValidityChange]);

  /* ---------- validación exhaustiva + submit ---------- */
  const validate = () => {
    const e: Record<string, string> = {};

    // Validaciones siempre visibles
    if (!form.title) e.title = "Campo obligatorio";
    if (!form.street) e.street = "Campo obligatorio";
    // El número NO es obligatorio, se pondrá "S/N" automáticamente si está vacío
    // Permitir crear sin coordenadas (se pueden agregar después o dejar sin validar)
    if (form.area <= 0) e.area = "Debe ser > 0";
    if (form.price <= 0) e.price = "Debe ser > 0";
    if (!form.description) e.description = "Campo obligatorio";
    if (!form.status) e.status = "Campo obligatorio";
    if (!form.operation) e.operation = "Campo obligatorio";
    if (!form.currency) e.currency = "Campo obligatorio";
    if ((form.owner?.id ?? 0) <= 0) e.owner = "Selecciona un propietario";
    if ((form.neighborhood?.id ?? 0) <= 0) e.neighborhood = "Selecciona un barrio";
    if ((form.type?.id ?? 0) <= 0) e.type = "Selecciona un tipo";
    if (!form.mainImage) e.mainImage = "Carga la imagen principal";

    // Expensas: debe existir (>= 0)
    if (form.expenses != null && form.expenses < 0) {
      e.expenses = "No puede ser negativo";
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
      number: form.number.trim() || "S/N", // Auto-populate "S/N" if empty
      ownerId: owner.id,
      neighborhoodId: neighborhood.id,
      typeId: type.id,
      amenitiesIds: amenities.map((a) => a.id),
      mainImage: form.mainImage as any,
      images: (form.images as any) ?? [],
    };
  };

  const getUpdateData = (): PropertyUpdate => {
    const { id, owner, neighborhood, type, amenities, ...rest } = form;
    return {
      id,
      ...rest,
      number: form.number.trim() || "S/N", // Auto-populate "S/N" if empty
      ownerId: owner.id,
      neighborhoodId: neighborhood.id,
      typeId: type.id,
      amenitiesIds: amenities.map((a) => a.id),
      mainImage: form.mainImage as any,
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

    /* imágenes (sobre el mismo form; compat API) */
    mainImage: (form.mainImage as any) ?? null,
    gallery: ((form.images as any) ?? []) as Img[],
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
