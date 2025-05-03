import { useState } from "react";
import { PropertyCreate } from "../types/property";

interface UseImageHandlersResult {
  handleMainImage: (
    f: File | null,
    form: PropertyCreate,
    setField: Function,
    onImageSelect?: Function
  ) => void;
  handleGalleryImages: (
    files: File[],
    form: PropertyCreate,
    setField: Function,
    onImageSelect?: Function
  ) => void;
  deleteImage: (
    file: File,
    form: PropertyCreate,
    setField: Function,
    onImageSelect?: Function
  ) => void;
  imageError: string | null;
  clearImageError: () => void;
}

export function useImageHandlers(): UseImageHandlersResult {
  const [imageError, setImageError] = useState<string | null>(null);

  const handleMainImage = (
    f: File | null,
    form: PropertyCreate,
    setField: Function,
    onImageSelect?: Function
  ) => {
    if (!f) {
      setField("mainImage", null);
      onImageSelect?.(null, form.images);
      return;
    }

    const alreadyMain = form.mainImage?.name === f.name;

    if (alreadyMain) {
      setImageError("Esta imagen ya está como principal");
      return;
    }
    const filteredGallery = form.images.filter((img) => img.name !== f.name);

    const previousMain = form.mainImage;
    const updatedGallery =
      previousMain &&
      !filteredGallery.some((img) => img.name === previousMain.name)
        ? [...filteredGallery, previousMain]
        : filteredGallery;

    setField("mainImage", f);
    setField("images", updatedGallery);
    onImageSelect?.(f, updatedGallery);
  };
  const handleGalleryImages = (
    files: File[],
    form: PropertyCreate,
    setField: Function,
    onImageSelect?: Function
  ) => {
    const existingNames = new Set(form.images.map((f) => f.name));
    const mainName = form.mainImage?.name;

    const { valid, duplicates } = files.reduce(
      (acc, file) => {
        if (existingNames.has(file.name) || file.name === mainName) {
          acc.duplicates.push(file.name);
        } else {
          acc.valid.push(file);
        }
        return acc;
      },
      { valid: [] as File[], duplicates: [] as string[] }
    );

    if (duplicates.length > 0) {
      if (duplicates.length === 1) {
        setImageError(`Se ignoró ${duplicates.length} imagen, ya está en uso`);
      } else {
        setImageError(
          `Se ignoraron ${duplicates.length} imagenes, ya están en uso`
        );
      }
    }

    if (valid.length === 0) return;

    const newGallery = [...form.images, ...valid];
    setField("images", newGallery);
    onImageSelect?.(form.mainImage, newGallery);
  };

  const deleteImage = (
    file: File,
    form: PropertyCreate,
    setField: Function,
    onImageSelect?: Function
  ) => {
    if (file === form.mainImage) {
      const [first, ...rest] = form.images;
      setField("mainImage", first ?? null);
      setField("images", rest);
      onImageSelect?.(first ?? null, rest);
    } else {
      const rest = form.images.filter((f) => f !== file);
      setField("images", rest);
      onImageSelect?.(form.mainImage, rest);
    }
  };

  const clearImageError = () => setImageError(null);

  return {
    handleMainImage,
    handleGalleryImages,
    deleteImage,
    imageError,
    clearImageError,
  };
}
