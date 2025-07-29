import { api } from "../../../../api";
import { ImageDTO } from "./image";

/* -------------------- GET galería -------------------- */
export async function getImagesByPropertyId(
  propId: number
): Promise<ImageDTO[]> {
  const { data } = await api.get<ImageDTO[]>(
    `/properties/image/getByProperty/${propId}`,
    { withCredentials: true }
  );
  return Array.isArray(data) ? data : [];
}

/* -------------------- POST imagen -------------------- Solamente de galeria, mainImage se toma como parte del PUT de propiedad */
export async function postImage(
  file: File,
  propertyId: number
): Promise<string> {
  const form = new FormData();
  form.append("propertyId", String(propertyId));
  form.append("file", file);

  try {
    const { data: url } = await api.post<string>(
      `/properties/image/upload`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/* -------------------- DELETE -------------------- */
export async function deleteImageById(id: number) {
  await api.delete(`/properties/image/delete/${id}`, {
    withCredentials: true,
  });
}
