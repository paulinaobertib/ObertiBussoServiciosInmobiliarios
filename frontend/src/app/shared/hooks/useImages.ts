import { useState, useRef } from 'react';
import type { Image } from '../components/images/image';

/* Clave única: nombre del File o string (URL) */
const keyOf = (img: Image) => (img instanceof File ? img.name : img);

export function useImages(
  initialMain: Image | null = null,
  initialGallery: Image[] = []
) {
  /* ---------- estado visible ---------- */
  const [mainImage, setMainImage] = useState<Image | null>(initialMain);
  const [gallery,   setGallery]   = useState<Image[]>(initialGallery);

  /* ---------- refs sincronizados ---------- */
  const mainRef    = useRef<Image | null>(initialMain);
  const galleryRef = useRef<Image[]>(initialGallery);

  /* Recordamos nombres eliminados para ignorar futuras selecciones */
  const deleted = useRef<Set<string>>(new Set());

  /* Helper: actualiza state + ref a la vez */
  const updateGallery = (updater: (prev: Image[]) => Image[]) => {
    setGallery(prev => {
      const next = updater(prev);
      galleryRef.current = next;   // ← ref siempre al día
      return next;
    });
  };

  /* ─── Cambiar principal ─── */
  function setMain(file: Image | null) {
    if (!file) { setMainImage(null); mainRef.current = null; return; }

    if (mainRef.current && keyOf(file) === keyOf(mainRef.current)) return; // ya era principal

    updateGallery(prev => prev.filter(img => keyOf(img) !== keyOf(file)));
    setMainImage(file);            // React state
    mainRef.current = file;        // ref
  }

  /* ─── Agregar a galería ─── */
  function addToGallery(items: Image[]) {
    updateGallery(prev => {
      const existing = new Set(prev.map(keyOf));
      if (mainRef.current) existing.add(keyOf(mainRef.current));

      const valid = items.filter(img => {
        const k = keyOf(img);
        return !existing.has(k) && !deleted.current.has(k);
      });

      return valid.length ? [...prev, ...valid] : prev;
    });
  }

  /* ─── Eliminar ─── */
  function remove(img: Image) {
    const k = keyOf(img);

    updateGallery(prev => prev.filter(i => keyOf(i) !== k));

    if (mainRef.current && keyOf(mainRef.current) === k) {
      setMainImage(null);
      mainRef.current = null;
    }
    deleted.current.add(k);  // impide volver a cargarlo en esta sesión
  }

  /* ─── Archivos listos para enviar ─── */
  function getFilesForUpload(): File[] {
    const list: File[] = [];
    if (mainRef.current instanceof File) list.push(mainRef.current);
    galleryRef.current.forEach(img => {
      if (img instanceof File) list.push(img);
    });
    return list;
  }

  /* (opcional) Permite re-subir eliminados tras reset/submit */
  function clearDeleted() {
    deleted.current.clear();
  }

  return {
    /* estado expuesto */
    mainImage,
    gallery,

    /* acciones */
    setMain,
    addToGallery,
    remove,

    /* helpers */
    getFilesForUpload,
    clearDeleted,
  };
}
