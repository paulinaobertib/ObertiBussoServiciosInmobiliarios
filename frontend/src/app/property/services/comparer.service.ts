import { api } from "../../../api";
import { PropertyDTOAI } from "../types/property";

export const comparerProperty = async (data: PropertyDTOAI[]) => {
    try {
        const response = await api.post(`/properties/compare`, data, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error comparing properties:", error);
        throw error;
    }
}