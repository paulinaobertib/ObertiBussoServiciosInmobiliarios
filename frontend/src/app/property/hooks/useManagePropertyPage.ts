import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ────── servicios REST ────── */
import {
  getPropertyById,
  postProperty,
  putProperty,
} from "../services/property.service";
import { getOwnerByPropertyId } from "../services/owner.service";
import {
  getImagesByPropertyId,
  postImage,
  deleteImageById,
  ImageDTO,
} from "../services/image.service";

/* ────── utilidades internas ────── */
import { useImages } from "../../shared/hooks/useImages";
import { usePropertiesContext } from "../context/PropertiesContext";
import { useConfirmDialog } from "../../shared/components/ConfirmDialog";
import { useGlobalAlert } from "../../shared/context/AlertContext";

/* ────── tipos auxiliares ────── */
import type { Image } from "../../shared/components/images/image";

export function useManagePropertyPage() {
  /* ---------- ruta y modo ---------- */
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const propId = Number(id);
  const nav = useNavigate();

  /* ---------- diálogos y alertas ---------- */
  const { ask, DialogUI } = useConfirmDialog();
  const { showAlert } = useGlobalAlert();

  /* ---------- refs y estado local ---------- */
  const formRef = useRef<any>(null);
  const img = useImages(null, []); // galería / imagen principal

  /* ─ Imagenes a eliminar en el próximo “Guardar” ─ */
  const [toDelete, setToDelete] = useState<number[]>([]);

  /* ─ Imágenes ya existentes en backend ─ */
  const [imagesBack, setImagesBack] = useState<ImageDTO[]>([]);

  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [activeStep, setActiveStep] = useState<0 | 1>(0);
  const [formReady, setFormReady] = useState(false);

  /* ---------- contexto de selección ---------- */
  const { setSelected, resetSelected, selected } = usePropertiesContext();

  /* ---------- cancelar con confirmación ---------- */
  const cancel = () =>
    ask("¿Cancelar y perder los cambios?", async () => nav("/"));

  /* ────── cargar propiedad + owner + imágenes (solo edición) ────── */
  useEffect(() => {
    // inicializar para modo “crear”
    resetSelected();
    img.setMain(null);
    img.addToGallery([]);
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
          getImagesByPropertyId(propId),
        ]);

        /* 1️⃣ guardar propiedad con su owner */
        setProperty({ ...prop, owner });

        /* 2️⃣ marcar selección de categorías */
        setSelected({
          owner: owner.id,
          type: prop.type?.id ?? null,
          neighborhood: prop.neighborhood?.id ?? null,
          amenities: prop.amenities?.map((a: { id: any }) => a.id) ?? [],
        });

        /* 3️⃣ imágenes: backend + galería local */
        setImagesBack(imgs);
        img.setMain(prop.mainImage);
        img.addToGallery(
          imgs
            .filter((i) => i.url !== prop.mainImage)
            .map((i) => i.url) as unknown as File[]
        );
      } catch {
        showAlert("No se pudo cargar la propiedad", "error");
        nav("/app");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, propId]);

  /* ────── manejo de imágenes en el form ────── */
  const handleImages = (
    main: string | File | null,
    gallery: (string | File)[]
  ) => {
    img.setMain(main as File | null);
    img.addToGallery(gallery.filter((g): g is File => g instanceof File));
  };

  const removeImage = (pic: Image) => {
    if (typeof pic === "string") {
      // marcar para borrado en el próximo “Guardar”
      const dto = imagesBack.find((i) => i.url === pic);
      if (dto) {
        setToDelete((ids) => [...ids, dto.id]);
        setImagesBack((arr) => arr.filter((i) => i.id !== dto.id));
      }
      // actualizar galería local visualmente
      const newGal = img.gallery.filter((g) => g !== pic);
      if (pic === img.mainImage) img.setMain(null);
      img.remove(pic); // uso de hook para eliminar visualmente
      formRef.current?.setField("images", newGal);
    } else {
      img.remove(pic); // solo File local
    }
  };

  /* ────── guardar ────── */
  const save = useCallback(
    () =>
      ask(
        isEdit ? "¿Guardar cambios en la propiedad?" : "¿Crear la propiedad?",
        async () => {
          if (!formRef.current) return;
          const form = formRef.current;
          const valid = await form.submit();
          if (!valid) {
            showAlert("Formulario inválido, faltan datos", "error");
            return;
          }

          try {
            setLoading(true);

            if (isEdit) {
              // 1️⃣ subir nuevas imágenes
              const galUrls = await Promise.all(
                img.gallery.map((p) =>
                  p instanceof File ? postImage(p, propId) : Promise.resolve(p)
                )
              );
              // 2️⃣ armar payload y actualizar propiedad
              const payload: any = {
                id: propId,
                ...form.getUpdateData(),
                images: galUrls,
              };
              if (img.mainImage instanceof File) {
                payload.mainImage = img.mainImage;
              }
              await putProperty(payload);

              // 3️⃣ procesar borrados pendientes
              await Promise.all(
                toDelete.map((imgId) => deleteImageById(imgId))
              );

              showAlert("Propiedad actualizada", "success");
            } else {
              // creación normal
              const dto = form.getCreateData();
              await postProperty(dto);
              showAlert("Propiedad creada", "success");
            }

            nav("/app");
          } catch (e: any) {
            showAlert(e.message ?? "Error al guardar", "error");
          } finally {
            setLoading(false);
          }
        }
      ),
    [isEdit, img, propId, toDelete]
  );

  /* ────── validación de pasaje de pasos ────── */
  const canProceed =
    !!selected.type &&
    !!selected.neighborhood &&
    !!selected.owner &&
    selected.amenities.length > 0;

  /* ────── título dinámico ────── */
  const title = property
    ? `Edición de ${property?.type?.name ?? "Propiedad"}`
    : `Alta de Propiedad`;

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
}
