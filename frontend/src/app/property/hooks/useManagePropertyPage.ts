import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPropertyById, postProperty, putProperty } from "../services/property.service";
import { getOwnerByPropertyId } from "../services/owner.service";
import { getImagesByPropertyId, postImage, deleteImageById } from "../../shared/components/images/image.service";
import { ImageDTO } from "../../shared/components/images/image";
import { useImages } from "../../shared/hooks/useImages";
import { usePropertiesContext } from "../context/PropertiesContext";
import { useGlobalAlert } from "../../shared/context/AlertContext";
import type { Image } from "../../shared/components/images/image";
import { useApiErrors } from "../../shared/hooks/useErrors";

type BackendImageDTO = ImageDTO;

export const useManagePropertyPage = () => {
  const nav = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const propId = Number(id);

  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  const formRef = useRef<any>(null);

  // imágenes (galería / principal) – fuente única de verdad
  const img = useImages(null, []);

  // para mapear url -> id y poder borrar en backend
  const imagesBack = useRef<BackendImageDTO[]>([]);
  const [toDelete, setToDelete] = useState<number[]>([]);

  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [activeStep, setActiveStep] = useState<0 | 1>(0);
  const [formReady, setFormReady] = useState(false);

  const { setSelected, resetSelected, selected } = usePropertiesContext();

  // Helpers de UI (confirmaciones / avisos)
  const confirmAction = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.confirm === "function") {
        return await alertApi.confirm({
          title,
          description,
        });
      }
    },
    [alertApi]
  );

  const warn = useCallback(
    async (message: string, title = "Atención") => {
      if (typeof alertApi?.warning === "function") {
        await alertApi.warning({ title, description: message, primaryLabel: "Entendido" });
      } else if (typeof alertApi?.showAlert === "function") {
        alertApi.showAlert(message, "warning");
      }
    },
    [alertApi]
  );

  const success = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Volver" });
      } else if (typeof alertApi?.showAlert === "function") {
        alertApi.showAlert(description ?? title, "success");
      }
    },
    [alertApi]
  );

  const cancel = useCallback(async () => {
    const ok = await confirmAction("¿Cancelar y perder los cambios?");
    if (ok) nav("/");
  }, [confirmAction, nav]);

  useEffect(() => {
    // inicializar (modo crear o al cambiar id)
    resetSelected();
    img.setMain(null);
    img.addToGallery([]);
    imagesBack.current = [];
    setToDelete([]);

    if (!isEdit) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);

        const [prop, owner, imgs] = await Promise.all([
          getPropertyById(propId),
          getOwnerByPropertyId(propId),
          getImagesByPropertyId(propId), // devuelve DTOs {id,url}
        ]);

        // 1) Propiedad + owner
        setProperty({ ...prop, owner });

        // 2) Selecciones de categorías
        setSelected({
          owner: owner.id,
          type: prop.type?.id ?? null,
          neighborhood: prop.neighborhood?.id ?? null,
          amenities: prop.amenities?.map((a: { id: number }) => a.id) ?? [],
        });

        // 3) Imágenes: guardamos DTOs para mapear y borrado
        imagesBack.current = imgs;

        // Inicializamos UI con principal + galería (strings)
        const mainUrl: string | null = prop.mainImage ?? null;
        const galleryUrls: string[] = imgs.map((i) => i.url).filter((u) => (mainUrl ? u !== mainUrl : true));

        img.setMain(mainUrl);
        img.addToGallery(galleryUrls); // acepta (string | File)[]
      } catch (e) {
        handleError(e);
        nav("/");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, propId]);

  /* ────── manejo de imágenes desde el form (ImageUploader) ────── */
  const handleImages = (main: string | File | null, gallery: (string | File)[]) => {
    img.setMain(main as Image | null);
    img.addToGallery(gallery as Image[]);
  };

  /* ────── quitar imagen (marca borrado si es del backend) ────── */
  const removeImage: (pic: Image) => void = (pic) => {
    if (typeof pic === "string") {
      const dto = imagesBack.current.find((i) => i.url === pic);
      if (dto) {
        setToDelete((ids) => (ids.includes(dto.id) ? ids : [...ids, dto.id]));
      }
      if (pic === img.mainImage) img.setMain(null);
    }
    img.remove(pic); // actualiza UI
    // si el form expone helpers, dejamos sincronizado el campo de imágenes
    const newGal = img.gallery.filter((g) => g !== pic);
    formRef.current?.setField?.("images", newGal);
    formRef.current?.deleteImage?.(pic);
  };

  const syncImagesIntoForm = () => {
    const form = formRef.current;
    if (!form) return false;

    // elegir principal: la que haya en img o la 1ª de la galería
    const main = img.mainImage ?? img.gallery[0] ?? null;

    // opcional: alinear la UI si no había principal
    if (!img.mainImage && img.gallery.length > 0) {
      img.setMain(img.gallery[0]);
    }

    form.setField?.("mainImage", (main ?? "") as any);
    form.setField?.("images", img.gallery as any);
    return true;
  };

  /* ────── guardar (create/update con flujo correcto de imágenes) ────── */
  const save = useCallback(async () => {
    const ok = await confirmAction(isEdit ? "¿Guardar cambios en la propiedad?" : "¿Crear la propiedad?");
    if (!ok) return;

    const form = formRef.current;
    if (!form) {
      await warn("El formulario aún no está listo");
      return;
    }

    // Sincroniza imágenes Page -> Form para que la validación use los valores correctos
    if (!syncImagesIntoForm()) {
      await warn("El formulario aún no está listo");
      return;
    }

    const valid = await form.submit();
    if (!valid) {
      await warn("Formulario inválido, faltan datos");
      return;
    }

    try {
      setLoading(true);

      // Definir main a enviar: preferimos img.mainImage; si no hay, primera de la galería
      const mainCandidate = img.mainImage ?? img.gallery[0];

      if (!isEdit) {
        /* ---------- CREATE ---------- */
        const createDto = form.getCreateData();
        const { data: created, status } = await postProperty({
          ...createDto,
          mainImage: mainCandidate,
        });
        if (status === 202 || status === 207) {
          await warn(created);
        } else {
          await success("Propiedad creada", created);
        }

        // Subir solo Files de la galería por el endpoint específico
        const galleryFiles = img.gallery.filter((g): g is File => g instanceof File);
        if (galleryFiles.length) {
          const rawId = created?.id ?? (created as any)?.data?.id;
          const propertyId =
            typeof rawId === "number" ? rawId : typeof rawId === "string" ? Number(rawId) : undefined;

          if (typeof propertyId === "number" && Number.isFinite(propertyId)) {
            await Promise.all(galleryFiles.map((f) => postImage(f, propertyId)));
          }
        }

        await success("Propiedad creada", "Se creó correctamente.");
        nav("/");
        return;
      }

      /* ---------- UPDATE ---------- */
      const updateDto = form.getUpdateData();
      await putProperty({
        ...updateDto,
        mainImage: mainCandidate,
      });

      // Subir solo Files nuevos de la galería
      const galleryFiles = img.gallery.filter((g): g is File => g instanceof File);
      if (galleryFiles.length) {
        await Promise.all(galleryFiles.map((f) => postImage(f, updateDto.id)));
      }

      // Borrar imágenes del backend marcadas previamente
      if (toDelete.length) {
        await Promise.all(toDelete.map((imageId) => deleteImageById(imageId)));
      }

      await success("Propiedad actualizada", "Se guardaron los cambios.");
      nav("/");
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [confirmAction, warn, success, handleError, img, isEdit, nav, toDelete]);

  /* ────── validación de pasaje de pasos (se mantiene tu lógica) ────── */
  const canProceed = !!selected.type && !!selected.neighborhood && !!selected.owner && selected.amenities.length > 0;

  /* ────── título dinámico ────── */
  const title = property ? `Edición de ${property?.type?.name ?? "Propiedad"}` : `Alta de Propiedad`;

  return {
    formRef,
    img: { ...img, remove: removeImage },
    handleImages,
    property,
    loading,
    activeStep,
    setActiveStep,
    canProceed,
    formReady,
    setFormReady,
    title,
    save,
    cancel,
  };
};
