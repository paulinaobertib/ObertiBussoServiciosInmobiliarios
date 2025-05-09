import { useRef, useState } from 'react';
import { Image } from '../types/image';

/** Hook compartido para Crear / Editar propiedades.
 *  - NO mueve la main image a la galería si se cambia.
 *  - NO reasigna un nuevo main automáticamente al borrar la foto principal.
 */
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

  /* borrar solo Files: se usa en Crear y Editar */
  const deleteImgFile = (file: File) => {
    if (file === main) {
      setMain(null);                 // simplemente se quita la principal
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