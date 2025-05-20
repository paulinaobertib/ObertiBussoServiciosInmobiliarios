import { useState } from "react";
import { Property } from "../types/property";

export function useImageHandlers() {
  const [imageError, setImageError] = useState<string | null>(null);

  /* ------------ handleMainImage ------------ */
  const handleMainImage = (
    f: File | null,
    form: Property,
    setField: (k: keyof Property, v: any) => void,
    onImageSelect?: (
      main: File | string | null,
      gallery: Array<File | string>
    ) => void
  ) => {
    if (!f) {
      setField("mainImage", null);
      onImageSelect?.(null, form.images);
      return;
    }

    if (form.mainImage instanceof File && form.mainImage.name === f.name) {
      setImageError("Esta imagen ya está como principal");
      return;
    }

    const filteredGallery = form.images.filter(
      (img) => !(img instanceof File && img.name === f.name)
    );

    setField("mainImage", f);
    setField("images", filteredGallery);
    onImageSelect?.(f, filteredGallery);
  };

  /* ------------ handleGalleryImages ------------ */
  const handleGalleryImages = (
    files: File[],
    form: Property,
    setField: (k: keyof Property, v: any) => void,
    onImageSelect?: (
      main: File | string | null,
      gallery: Array<File | string>
    ) => void
  ) => {
    const existing = new Set(
      form.images.filter((f): f is File => f instanceof File).map((f) => f.name)
    );
    const mainValue = form.mainImage; // puede ser File | string | null

    const { valid, duplicates } = files.reduce(
      (acc, file) => {
        if (
          existing.has(file.name) ||
          (mainValue instanceof File && file.name === mainValue.name)
        ) {
          acc.duplicates.push(file.name);
        } else {
          acc.valid.push(file);
        }
        return acc;
      },
      { valid: [] as File[], duplicates: [] as string[] }
    );

    if (duplicates.length) {
      setImageError(
        duplicates.length === 1
          ? "Se ignoró 1 imagen; ya está en uso"
          : `Se ignoraron ${duplicates.length} imágenes; ya están en uso`
      );
    }
    if (!valid.length) return;

    const newGallery: Array<File | string> = [...form.images, ...valid];
    setField("images", newGallery);
    onImageSelect?.(mainValue, newGallery);
  };

  /* ------------ deleteImage ------------ */
  const deleteImage = (
    file: File,
    form: Property,
    setField: (k: keyof Property, v: any) => void,
    onImageSelect?: (
      main: File | string | null,
      gallery: Array<File | string>
    ) => void
  ) => {
    const mainValue = form.mainImage;
    if (file === mainValue) {
      setField("mainImage", null);
      onImageSelect?.(null, form.images);
    } else {
      const rest = form.images.filter((f) => f !== file);
      setField("images", rest);
      onImageSelect?.(mainValue, rest);
    }
  };

  /* ------------ utils ------------ */
  const clearImageError = () => setImageError(null);

  return {
    handleMainImage,
    handleGalleryImages,
    deleteImage,
    imageError,
    clearImageError,
  };
}