import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

// Función para subir una imagen a una propiedad
export const uploadImage = async (file: File, propertyId: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('propertyId', propertyId.toString());

    try {
        const response = await axios.post(`${apiUrl}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    // Aquí puedes manejar el progreso de la carga si lo necesitas
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Progreso: ${progress}%`);
                }
            },
        });
        return response.data; // Devolvemos la respuesta (url de la imagen)
    } catch (error) {
        console.error("Error subiendo la imagen:", error);
        throw error; // Propagar el error para que el frontend lo maneje
    }
};

// Función para eliminar una imagen
export const deleteImage = async (imageId: number) => {
    try {
        const response = await axios.delete(`${apiUrl}/delete/${imageId}`);
        return response.data; // Mensaje de éxito
    } catch (error) {
        console.error("Error eliminando la imagen:", error);
        throw error; // Propagar el error para que el frontend lo maneje
    }
};

// Función para obtener todas las imágenes de una propiedad
export const getImagesByProperty = async (propertyId: number) => {
    try {
        const response = await axios.get(`${apiUrl}/getByProperty/${propertyId}`);
        return response.data; // Devuelve la lista de imágenes
    } catch (error) {
        console.error("Error obteniendo las imágenes:", error);
        throw error; // Propagar el error para que el frontend lo maneje
    }
};