import { useEffect } from "react";
import { useComparerProperty } from "../../hooks/useComparer";
import { PropertyDTOAI } from "../../types/property";
import { Box, CircularProgress, Typography } from "@mui/material";

type ComparerProps = {
  data: PropertyDTOAI[];
};

export const Comparer = ({ data }: ComparerProps) => {
    const { compare, loading, result, error } = useComparerProperty();

    useEffect (() => {
        if (data.length >= 2 && data.length <= 3) {
            compare(data);
        }
    }, [data]);


    return (
        <Box sx={{ p: 3 }}>
            {loading && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body1">Comparando propiedades...</Typography>
                </Box>
            )}

            {result && (
                <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
                    {result}
                </Typography>
            )}

            {error && (
                <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}

            {!loading && !result && !error && (
                <Typography variant="body2" color="text.secondary">
                    Esperando selección de propiedades para comparar.
                </Typography>
            )}
        </Box>
    )
}