import axios from "axios";

// URL base para el backend
const apiUrl = import.meta.env.VITE_API_URL;

export interface PropertyPayload {
  title: string;
  street: string;
  number: string;
  rooms: number; // <- Falta
  bathrooms: number;  // <- Falta
  bedrooms: number; // <- Falta
  area: number; // <- Falta
  price: number;
  description: string;
  status: string;
  operation: string;
  currency: string;
  ownerId: number;
  neighborhoodId: number;
  typeId: number;
  amenitiesIds: number[];
  // --- archivos ---
  mainImage: File; // obligatorio
  images: File[]; // opcional
}

export const postProperty = async (dataObj: PropertyPayload) => {
  /* 1. construimos FormData */
  const fd = new FormData();

  // parte “data” → JSON como Blob para que Spring lo detecte como application/json
  const {
    mainImage, // sacamos los archivos
    images,
    ...plainFields // queda solo lo serializable
  } = dataObj;

  fd.append(
    "data",
    new Blob([JSON.stringify(plainFields)], { type: "application/json" })
  );

  // mainImage obligatoria
  fd.append("mainImage", mainImage);

  // imágenes adicionales (si existen)
  images?.forEach((img) => fd.append("images", img));

  /* 2. enviamos SIN tocar Content-Type */
  try {
    return (await axios.post("http://localhost:8083/property/create", fd)).data;
  } catch (err: any) {
    console.error("⛔ Axios error");
    console.error("Status :", err.response?.status);
    console.error("Body   :", err.response?.data);
    console.error("Headers:", err.response?.headers);

    throw err;
  }
};

// Actualizar una propiedad
// export const putProperty = async (propertyData: PropertyUpdateDTO) => {
//   try {
//     const response = await axios.put(
//       `${apiUrl}/property/update/${propertyData.id}`,
//       propertyData,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error al actualizar la propiedad:", error);
//     throw new Error("Error al actualizar la propiedad");
//   }
// };

// Eliminar una propiedad
// export const deleteProperty = async (propertyId: number) => {
//   try {
//     const response = await axios.delete(
//       `${apiUrl}/property/delete/${propertyId}`
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error al eliminar la propiedad:", error);
//     throw new Error("Error al eliminar la propiedad");
//   }
// };

// Obtener todas las propiedades
export const getAllProperties = async () => {
  try {
    const response = await axios.get("${apiUrl}/property/getAll");
    return response.data; // Devuelve la lista de propiedades
  } catch (error) {
    console.error("Error al obtener las propiedades:", error);
    throw new Error("Error al obtener las propiedades");
  }
};

// Obtener una propiedad por ID
export const getPropertyById = async (propertyId: number) => {
  try {
    const response = await axios.get(
      `${apiUrl}/property/getById/${propertyId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener la propiedad:", error);
    throw new Error("Error al obtener la propiedad");
  }
};
