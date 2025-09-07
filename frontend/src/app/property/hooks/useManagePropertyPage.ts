import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPropertyById, postProperty, putProperty } from "../services/property.service";
import { getOwnerByPropertyId } from "../services/owner.service";
import { getImagesByPropertyId, postImage, deleteImageById } from "../../shared/components/images/image.service";
import { ImageDTO } from "../../shared/components/images/image";
import { useImages } from "../../shared/hooks/useImages";
import { usePropertiesContext } from "../context/PropertiesContext";
import { useConfirmDialog } from "../../shared/components/ConfirmDialog";
import { useGlobalAlert } from "../../shared/context/AlertContext";
import type { Image } from "../../shared/components/images/image";
import { useApiErrors } from "../../shared/hooks/useErrors";

type BackendImageDTO = ImageDTO; // { id: number; url: string }

export const useManagePropertyPage = () => {
  const nav = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const propId = Number(id);
  const { ask, DialogUI } = useConfirmDialog();
  const { showAlert } = useGlobalAlert();
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

  const cancel = () => ask("¿Cancelar y perder los cambios?", async () => nav("/"));

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

        // Traemos todo lo del hook “bueno” de datos
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
    // solo agregamos lo nuevo; el hook ya sabe mezclar
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
  const save = useCallback(
    () =>
      ask(isEdit ? "¿Guardar cambios en la propiedad?" : "¿Crear la propiedad?", async () => {
        const form = formRef.current;
        if (!form) return;

        // Sincroniza imágenes Page -> Form para que la validación use los valores correctos
        if (!syncImagesIntoForm()) {
          showAlert("El formulario aún no está listo", "error");
          return;
        }

        const valid = await form.submit();
        if (!valid) {
          showAlert("Formulario inválido, faltan datos", "error");
          return;
        }

        try {
          setLoading(true);

          // Definir main a enviar: preferimos img.mainImage; si no hay, primera de la galería
          const mainCandidate = img.mainImage ?? img.gallery[0];

          if (!isEdit) {
            /* ---------- CREATE ---------- */
            const createDto = form.getCreateData();
            // `postProperty` debe recibir la mainImage dentro del DTO
            const created = await postProperty({
              ...createDto,
              mainImage: mainCandidate,
              // images: [], // la galería NO viaja en postProperty
            });
            const propertyId = created.id;

            // Subir solo Files de la galería por el endpoint específico
            const galleryFiles = img.gallery.filter((g): g is File => g instanceof File);
            if (galleryFiles.length) {
              await Promise.all(galleryFiles.map((f) => postImage(f, propertyId)));
            }

            showAlert("Propiedad creada", "success");
            nav("/");
            return;
          }

          /* ---------- UPDATE ---------- */
          const updateDto = form.getUpdateData();
          // `putProperty` también recibe mainImage (File o string)
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

          showAlert("Propiedad actualizada", "success");
          nav("/");
        } catch (e) {
          handleError(e);
        } finally {
          setLoading(false);
        }
      }),
    [ask, formRef, handleError, img, isEdit, nav, showAlert, toDelete]
  );

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
    DialogUI,
  };
};