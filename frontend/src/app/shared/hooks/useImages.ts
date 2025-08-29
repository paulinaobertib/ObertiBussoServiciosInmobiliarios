import { useCallback, useMemo, useState } from "react";
import type { Image } from "../components/images/image";

/** Stable key for any Image (File or URL) */
const keyOf = (img: Image) => (img instanceof File ? `${img.name}#${img.size}#${img.lastModified}` : img);

/**
 * Unifies image state handling (main + gallery) for both existing (URL) and local (File) items.
 * - Keeps preview state as the single source of truth (no hidden "queues").
 * - Removing an item really removes it from state, so it won’t be uploaded later.
 * - Works for any combination: start empty, start with backend URLs, mix with new Files, etc.
 */
export function useImages(initialMain: Image | null = null, initialGallery: Image[] = []) {
  /** Visible state (single source of truth) */
  const [mainImage, setMainImage] = useState<Image | null>(initialMain);
  const [gallery, setGallery] = useState<Image[]>(() => {
    // Ensure we don’t duplicate the main in the gallery
    const mainK = initialMain ? keyOf(initialMain) : null;
    const dedup = new Map<string, Image>();
    for (const g of initialGallery) {
      const k = keyOf(g);
      if (k !== mainK && !dedup.has(k)) dedup.set(k, g);
    }
    return Array.from(dedup.values());
  });

  /** Public actions */
  const setMain = useCallback(
    (img: Image | null) => {
      if (img == null) {
        setMainImage(null);
        return;
      }
      // If the image we set as main was in the gallery, remove it there
      const k = keyOf(img);
      setGallery((prev) => prev.filter((g) => keyOf(g) !== k));
      setMainImage(img);
    },
    [setGallery]
  );

  const addToGallery = useCallback(
    (items: Image[] | Image) => {
      const list = Array.isArray(items) ? items : [items];
      setGallery((prev) => {
        const out = new Map(prev.map((g) => [keyOf(g), g]));
        const mainK = mainImage ? keyOf(mainImage) : null;
        for (const it of list) {
          const k = keyOf(it);
          if (k === mainK) continue; // never duplicate the main in gallery
          if (!out.has(k)) out.set(k, it);
        }
        return Array.from(out.values());
      });
    },
    [mainImage]
  );

  const remove = useCallback(
    (img: Image) => {
      const k = keyOf(img);
      // If it's the current main → clear it
      setMainImage((curr) => (curr && keyOf(curr) === k ? null : curr));
      // Remove from gallery if present
      setGallery((prev) => prev.filter((g) => keyOf(g) !== k));
    },
    [setMainImage, setGallery]
  );

  /** Derived helpers for persistence layers */
  const newMainFile = useMemo(() => (mainImage instanceof File ? mainImage : null), [mainImage]);
  const newGalleryFiles = useMemo(() => gallery.filter((g): g is File => g instanceof File), [gallery]);

  return {
    /** state */
    mainImage,
    gallery,

    /** actions */
    setMain,
    addToGallery,
    remove,

    /** helpers */
    getFilesForUpload: () => ({
      main: newMainFile,
      gallery: newGalleryFiles,
    }),
  };
}