import { useRef, useState } from 'react';
import { Image } from '../types/image';

export function useCreateProperty() {
  const formRef = useRef<any>(null);

  const [main,    setMain]    = useState<Image | null>(null);
  const [gallery, setGallery] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);

  /* cargar / precargar */
  const handleImages = (m: Image | null, g: Image[]) => {
    setMain(m);
    setGallery(g);
  };

  /* borrar solo Files: se usa en Crear y como helper en Editar */
  const deleteImgFile = (file: File) => {
    if (main instanceof File && file === main) {
      const [first, ...rest] = gallery;
      setMain(first ?? null);
      setGallery(rest);
    } else {
      setGallery(gallery.filter(f => f !== file));
    }
    formRef.current?.deleteImage?.(file);
  };

  const reset = () => {
    setMain(null);
    setGallery([]);
  };

  return {
    formRef,
    main,
    gallery,
    setMain,
    setGallery,
    loading,
    setLoading,
    handleImages,
    deleteImgFile,
    reset,
  };
}
