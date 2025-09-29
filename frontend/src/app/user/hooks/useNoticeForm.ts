import { useEffect, useState } from "react";
import { useImages } from "../../shared/hooks/useImages";
import type { Image } from "../../shared/components/images/image";

export interface NoticeFormState {
  id?: number;
  title: string;
  description: string;
  mainImage: Image | null;
}

export function useNoticeForm(initial?: NoticeFormState, onValidChange?: (v: boolean) => void) {
  /* ---------- estado base ---------- */
  const [form, setForm] = useState<NoticeFormState>({
    id: initial?.id,
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    mainImage: initial?.mainImage ?? null,
  });

  /* ---------- imágenes ---------- */
  const { mainImage, setMain } = useImages(initial?.mainImage ?? null, []);

  /* sincroniza la imagen principal con el form */
  useEffect(() => {
    setForm((f) => ({ ...f, mainImage }));
  }, [mainImage]);

  /* ---------- helpers ---------- */
  const setField = <K extends keyof NoticeFormState>(k: K, v: NoticeFormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  /* ---------- validación ---------- */
  const valid = form.title.trim() !== "" && form.description.trim() !== "" && form.mainImage !== null;

  useEffect(() => onValidChange?.(valid), [valid, onValidChange]);

  /* ---------- DTOs ---------- */
  const getCreateData = () => ({
    ...form,
  });

  const getUpdateData = () => ({
    ...form,
  });

  return {
    form,

    setField,
    setMain,
    validate: () => valid,
    getCreateData,
    getUpdateData,
  };
}
