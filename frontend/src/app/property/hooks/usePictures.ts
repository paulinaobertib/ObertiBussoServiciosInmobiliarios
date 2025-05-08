import { useState } from 'react';
import {
  ImageDTO, postImage, deleteImageById,
} from '../services/image.service';

export type Pic = ImageDTO | File | string;   // string = url recién subida

export function usePictures(initial: ImageDTO[], propId: number) {
  const [pics, setPics] = useState<Pic[]>(initial);

  /* subir Files de galería (isMain = false) */
  const addFiles = async (files: File[]) => {
    const urls = await Promise.all(files.map(f => postImage(f, propId, false)));
    setPics(prev => [...prev, ...urls]);        // sólo strings
  };

  /* eliminar (sólo BD si hay id) */
  const remove = async (pic: Pic) => {
    if (typeof pic !== 'string' && !(pic instanceof File)) {  // ImageDTO
      await deleteImageById(pic.id);
    }
    setPics(prev => prev.filter(p => p !== pic));
  };

  const urlOf = (p: Pic) =>
    p instanceof File ? URL.createObjectURL(p) :
    typeof p === 'string' ? p : p.url;

  return { pics, addFiles, remove, urlOf };
}
