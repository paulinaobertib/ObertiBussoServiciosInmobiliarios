/* src/app/property/hooks/useImageHandlers.ts ------------------------ */
import { useState } from 'react';
import { PropertyCreate } from '../types/property';

interface HookReturn {
  handleMainImage: (
    f: File | null,
    form: PropertyCreate,
    setField: (k: keyof PropertyCreate, v: any) => void,
    onImageSelect?: (main: File | null, gallery: File[]) => void
  ) => void;
  handleGalleryImages: (
    files: File[],
    form: PropertyCreate,
    setField: (k: keyof PropertyCreate, v: any) => void,
    onImageSelect?: (main: File | null, gallery: File[]) => void
  ) => void;
  deleteImage: (
    file: File,
    form: PropertyCreate,
    setField: (k: keyof PropertyCreate, v: any) => void,
    onImageSelect?: (main: File | null, gallery: File[]) => void
  ) => void;
  imageError: string | null;
  clearImageError: () => void;
}

export function useImageHandlers(): HookReturn {
  const [imageError, setImageError] = useState<string | null>(null);

  /* --------------- principal --------------- */
  const handleMainImage = (
    f: File | null,
    form: PropertyCreate,
    setField: (k: keyof PropertyCreate, v: any) => void,
    onImageSelect?: (main: File | null, gallery: File[]) => void
  ) => {
    /* quitar principal ⇒ poner null y mantener galería */
    if (!f) {
      setField('mainImage', null);
      onImageSelect?.(null, form.images);
      return;
    }

    const alreadyMain = form.mainImage?.name === f.name;
    if (alreadyMain) {
      setImageError('Esta imagen ya está como principal');
      return;
    }

    /* quito de galería si la misma foto entra como principal */
    const filteredGallery = form.images.filter(img => img.name !== f.name);

    const previousMain = form.mainImage;
    const updatedGallery =
      previousMain && !filteredGallery.some(img => img.name === previousMain.name)
        ? [...filteredGallery, previousMain]
        : filteredGallery;

    setField('mainImage', f);
    setField('images', updatedGallery);
    onImageSelect?.(f, updatedGallery);
  };

  /* --------------- galería --------------- */
  const handleGalleryImages = (
    files: File[],
    form: PropertyCreate,
    setField: (k: keyof PropertyCreate, v: any) => void,
    onImageSelect?: (main: File | null, gallery: File[]) => void
  ) => {
    const existing = new Set(form.images.map(f => f.name));
    const mainName = form.mainImage?.name;

    const { valid, duplicates } = files.reduce(
      (acc, file) => {
        if (existing.has(file.name) || file.name === mainName) acc.duplicates.push(file.name);
        else acc.valid.push(file);
        return acc;
      },
      { valid: [] as File[], duplicates: [] as string[] }
    );

    if (duplicates.length) {
      setImageError(
        duplicates.length === 1
          ? 'Se ignoró 1 imagen; ya está en uso'
          : `Se ignoraron ${duplicates.length} imágenes; ya están en uso`
      );
    }

    if (!valid.length) return;

    const newGallery = [...form.images, ...valid];
    setField('images', newGallery);
    onImageSelect?.(form.mainImage, newGallery);
  };

  /* --------------- eliminar --------------- */
  const deleteImage = (
    file: File,
    form: PropertyCreate,
    setField: (k: keyof PropertyCreate, v: any) => void,
    onImageSelect?: (main: File | null, gallery: File[]) => void
  ) => {
    if (file === form.mainImage) {
      const [first, ...rest] = form.images;
      setField('mainImage', first ?? null);
      setField('images', rest);
      onImageSelect?.(first ?? null, rest);
    } else {
      const rest = form.images.filter(f => f !== file);
      setField('images', rest);
      onImageSelect?.(form.mainImage, rest);
    }
  };

  /* --------------- utils --------------- */
  const clearImageError = () => setImageError(null);

  return {
    handleMainImage,
    handleGalleryImages,
    deleteImage,
    imageError,
    clearImageError,
  };
}
