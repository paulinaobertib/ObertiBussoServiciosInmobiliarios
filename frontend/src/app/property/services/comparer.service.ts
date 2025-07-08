import { api } from "../../../api";
import { PropertyDTOAI } from "../types/property";

export const comparerProperty = async (data: PropertyDTOAI[]) => {

    const payload = data.map((property) => ({
        ...property,
        amenities: Array.from(property.amenities),
    }));

    try {
        const response = await api.post(`/properties/compare`, payload, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error comparing properties:", error);
        throw error;
    }
}