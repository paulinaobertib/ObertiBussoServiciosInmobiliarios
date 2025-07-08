import { useState } from "react";
import { comparerProperty } from "../services/comparer.service";
import { PropertyDTOAI } from "../types/property";

export const useComparerProperty = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const compare = async (data: PropertyDTOAI[]) => {
        setLoading(true);
        setError(null);

        try {
            const response = await comparerProperty(data);
            setResult(response);
        } catch (err: any){
            setError(err?.response.data || "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    return { compare, loading, result, error };
}