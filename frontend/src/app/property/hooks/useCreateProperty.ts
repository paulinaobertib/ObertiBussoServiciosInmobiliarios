import { useRef, useState } from "react";
import { Image } from "../types/image";

export function useCreateProperty() {
  const formRef = useRef<any>(null);

  const [main, setMain] = useState<Image | null>(null);
  const [gallery, setGallery] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImages = (m: Image | null, g: Image[]) => {
    setMain(m);
    setGallery(g);
  };

  const deleteImgFile = (file: File) => {
    if (file === main) {
      setMain(null);
    } else {
      setGallery(gallery.filter((f) => f !== file));
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