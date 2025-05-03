import axios from "axios";
import { PropertyCreate } from "../types/property";

const apiUrl = import.meta.env.VITE_API_URL;

export async function postProperty(data: PropertyCreate) {
  const fd = new FormData();
  const { mainImage, images, ...plainFields } = data;

  fd.append(
    "data",
    new Blob([JSON.stringify(plainFields)], { type: "application/json" })
  );

  if (mainImage) fd.append("mainImage", mainImage);
  images.forEach((img) => fd.append("images", img));

  try {
    return (await axios.post(`${apiUrl}/property/create`, fd)).data;
  } catch (err: any) {
    console.error("Error al enviar la propiedad:", err);
    throw err;
  }
}
