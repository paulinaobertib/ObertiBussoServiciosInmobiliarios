export const IMAGE_BASE_URL =
  "https://storageimages.blob.core.windows.net/images/";

export function toImageUrl(
  image: string | File | { url: string } | null | undefined
): string {
  if (!image) return "";

  if (typeof image === "string") {
    // 🔍 Evitá duplicar la URL si ya viene completa
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `${IMAGE_BASE_URL}${image}`;
  }

  if (image instanceof File) return URL.createObjectURL(image);

  if (
    typeof image === "object" &&
    "url" in image &&
    typeof image.url === "string"
  ) {
    return image.url;
  }

  console.warn("❗ Valor inválido para toImageUrl:", image);
  return "";
}
