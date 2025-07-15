import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { usePropertiesContext } from "../context/PropertiesContext";
import { useConfirmDialog } from "../../shared/components/ConfirmDialog";
import { useGlobalAlert } from "../../shared/context/AlertContext";

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

import { ROUTES } from "../../../lib";
import { useImages } from "../../shared/hooks/useImages";
import type { Property } from "../types/property";
import type { Image } from "../../shared/components/images/image";

export function useManagePropertyPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const propId = Number(id);

  const { showAlert } = useGlobalAlert();
  const { ask, DialogUI } = useConfirmDialog();
  const navigate = useNavigate();
  const formRef = useRef<any>(null);

  const {
    resetSelected,
    refreshTypes,
    refreshNeighborhoods,
    refreshAmenities,
    refreshOwners,
    selected,
    typesList,
    setSelected,
  } = usePropertiesContext();

  const img = useImages(null, []);
  const [imagesBackend, setImagesBackend] = useState<ImageDTO[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [activeStep, setActiveStep] = useState(0);
  const [formReady, setFormReady] = useState(false);

  /* ---------- preload ---------- */
  useEffect(() => {
    const preload = Promise.all([
      refreshTypes(),
      refreshNeighborhoods(),
      refreshAmenities(),
      refreshOwners(),
    ]);

    resetSelected();
    img.setMain(null);
    img.addToGallery([]);

    if (!isEdit) {
      preload.then(() => setLoading(false));
      return;
    }

    (async () => {
      try {
        setLoading(true);
        await preload;

        const [prop, owner, imgs] = await Promise.all([
          getPropertyById(propId),
          getOwnerByPropertyId(propId),
          getImagesByPropertyId(propId),
        ]);

        setSelected({
          owner: owner.id,
          neighborhood: prop.neighborhood?.id ?? null,
          type: prop.type?.id ?? null,
          amenities: prop.amenities?.map((a: { id: any }) => a.id) ?? [],
        });

        setProperty({ ...prop, owner });
        setImagesBackend(imgs);

        img.setMain(prop.mainImage);
        img.addToGallery(
          imgs
            .filter((i) => i.url !== prop.mainImage)
            .map((i) => i.url) as unknown as File[]
        );
      } catch {
        showAlert("No se pudo cargar la propiedad", "error");
        navigate(ROUTES.HOME_APP);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ---------- helpers imágenes ---------- */
  const handleImages = (
    main: string | File | null,
    gallery: (string | File)[]
  ) => {
    img.setMain(main as File | null);
    img.addToGallery(gallery.filter((g): g is File => g instanceof File));
  };

  const removeImage = async (pic: Image) => {
    if (typeof pic === "string") {
      const dto = imagesBackend.find((i) => i.url === pic);
      if (dto) {
        await deleteImageById(dto.id);
        setImagesBackend((arr) => arr.filter((i) => i.id !== dto.id));
      }
      const newGal = img.gallery.filter((g) => g !== pic);
      if (pic === img.mainImage) img.setMain(null);
      img.addToGallery(newGal as unknown as File[]);
      formRef.current?.setField("images", newGal);
    } else {
      img.remove(pic);
    }
  };

  /* ---------- guardar ---------- */
  const save = useCallback(
    () =>
      ask(
        isEdit ? "¿Guardar cambios en la propiedad?" : "¿Crear la propiedad?",
        async () => {
          if (!formRef.current) {
            showAlert("El formulario aún no está listo", "error");
            return;
          }

          const form = formRef.current;
          if (!form) {
            // ⬅︎ ref todavía no está
            showAlert(
              "El formulario no está listo. Intenta de nuevo.",
              "error"
            );
            return;
          }
          const valid = await form.submit();
          if (!valid) {
            showAlert("Formulario inválido, faltan datos", "error");
            return;
          }
          try {
            setLoading(true);

            if (isEdit) {
              const galleryUrls = await Promise.all(
                img.gallery.map((p) =>
                  p instanceof File ? postImage(p, propId) : Promise.resolve(p)
                )
              );

              const payload: any = {
                id: propId,
                ...form.getUpdateData(),
                images: galleryUrls,
              };
              if (img.mainImage instanceof File)
                payload.mainImage = img.mainImage;

              await putProperty(payload);
              showAlert("Propiedad actualizada", "success");
            } else {
              const data = form.getCreateData();
              await postProperty(data);
              showAlert("Propiedad creada", "success");
            }
            navigate(ROUTES.HOME_APP);
          } catch (e: any) {
            const msg =
              e.response?.data ||
              e.response?.statusText ||
              e.message ||
              "Error al guardar";
            console.error("PUT /properties error →", e); // debug en consola
            showAlert(msg, "error");
          } finally {
            setLoading(false);
          }
        }
      ),
    [isEdit, img]
  );

  const cancel = () =>
    ask("¿Cancelar los cambios?", async () => {
      formRef.current?.reset();
      resetSelected();
      navigate(ROUTES.HOME_APP);
    });

  const canProceed =
    !!selected.type &&
    !!selected.neighborhood &&
    !!selected.owner &&
    selected.amenities.length > 0;

  const typeName =
    typesList.find((t) => t.id === Number(selected.type))?.name ?? "";
  const title = isEdit
    ? `Edición de ${typeName || "Propiedad"}`
    : `Formulario de Creación de ${typeName || "Propiedad"}`;

  return {
    formRef,
    img: { ...img, remove: removeImage },
    handleImages,
    property,
    loading,
    activeStep,
    setActiveStep,
    formReady,
    setFormReady,
    canProceed,
    title,
    save,
    cancel,
    DialogUI,
  };
}
