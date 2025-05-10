import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export interface ImageDTO {
  id: number; // sólo las que vienen de GET
  url: string;
}

/* -------------------- GET galería -------------------- */
export async function getImagesByPropertyId(
  propId: number
): Promise<ImageDTO[]> {
  const { data } = await axios.get<ImageDTO[]>(
    `${apiUrl}/properties/image/getByProperty/${propId}`
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
    const { data: url } = await axios.post<string>(
      `${apiUrl}/properties/image/upload`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/* -------------------- DELETE -------------------- */
export async function deleteImageById(id: number) {
  await axios.delete(`${apiUrl}/properties/image/delete/${id}`);
}

