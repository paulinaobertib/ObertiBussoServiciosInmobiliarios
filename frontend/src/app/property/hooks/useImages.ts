import { useState } from "react";
import type { Image } from "../types/image";

/**
 * Maneja mainImage + gallery, valida duplicados y expone errores.
 * Ahora acepta tanto File como string (URL) en todas sus APIs.
 */
export function useImages(
  initialMain: Image | null = null,
  initialGallery: Image[] = []
) {
  const [mainImage, setMainImage] = useState<Image | null>(initialMain);
  const [gallery,   setGallery  ] = useState<Image[]>(initialGallery);
  const [error,     setError    ] = useState<string | null>(null);

  /* ---------- helpers ---------- */
  const clearError = () => setError(null);

  /* ---------- alta / edición ---------- */
  function setMain(file: Image | null) {
    if (!file) return setMainImage(null);

    /* si es File, chequeamos duplicados por nombre */
    if (file instanceof File) {
      if ((mainImage instanceof File) && file.name === mainImage.name)
        return setError("Esta imagen ya es la principal");

      // quitarla de la galería si estaba
      setGallery(gallery.filter(
        img => !(img instanceof File && img.name === file.name)
      ));
    }
    setMainImage(file);
  }

  function addToGallery(items: Image[]) {
    const duplicates = new Set<Image>();

    /* 1) nombre de Files ya cargados */
    gallery
      .filter((f): f is File => f instanceof File)
      .forEach(f => duplicates.add(f.name as unknown as Image));

    /* 2) string (URL) ya cargados */
    gallery
      .filter((f): f is string => typeof f === "string")
      .forEach(u => duplicates.add(u));

    if (mainImage instanceof File) duplicates.add(mainImage.name as any);
    if (typeof mainImage === "string") duplicates.add(mainImage);

    const valid = items.filter(img => {
      if (img instanceof File) return !duplicates.has(img.name as any);
      return !duplicates.has(img);
    });

    if (!valid.length) {
      setError("Todos los archivos ya estaban cargados");
      return;
    }
    if (valid.length < items.length) {
      setError("Algunas imágenes fueron ignoradas por duplicadas");
    }
    setGallery(prev => [...prev, ...valid]);
  }

  /* ---------- baja ---------- */
  function remove(img: Image) {
    if (img === mainImage) {
      setMainImage(null);
    } else {
      setGallery(prev => prev.filter(i => i !== img));
    }
  }

  return {
    mainImage,
    gallery,
    error,
    clearError,
    setMain,
    addToGallery,
    remove,
  };
}
