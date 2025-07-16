import { useEffect, useState } from "react";
import { useComparerProperty } from "../../hooks/useComparer";
import { PropertyDTOAI } from "../../types/property";
import { Box, CircularProgress, Typography, Paper, Avatar, Fade } from "@mui/material";
import HouseIcon from "@mui/icons-material/House";

type ComparerProps = {
  data: PropertyDTOAI[];
};

export const Comparer = ({ data }: ComparerProps) => {
  const { compare, loading, result, error } = useComparerProperty();

  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (data.length >= 2 && data.length <= 3) {
      compare(data);
    }
  }, [data]);

  return (
    <Box sx={{ pl: 2, display: "flex", alignItems: "flex-start", maxWidth: 700, mx: "auto"  }}>
        <Avatar onClick={() => setOpen((o) => !o)} sx={{ mr: 1.5, bgcolor: "#EE671E", width: 56, height: 56, fontSize: 30, cursor: "pointer", userSelect: "none" }}>
            <HouseIcon />
        </Avatar>

        { open && (
            <Box sx={{ flex: 1 }}>
                {loading && (
                <Paper elevation={3} sx={{ p: 2, borderRadius: 4, border: "2px solid #EB7333", position: "relative", backgroundColor: "#EB7333", "::before": { content: "''", position: "absolute", left: -10, top: 20, width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderRight: "10px solid #EE671E" } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={18} sx={{ color: "#FED7AA" }} />
                    <Typography variant="body1" sx={{ color: "#FED7AA" }}>Estoy analizando las propiedades...</Typography>
                    </Box>
                </Paper>
                )}

                {error && (
                <Paper elevation={3} sx={{ p: 2, borderRadius: 4, border: "2px solid red", backgroundColor: "#ffe5e5" }} >
                    <Typography variant="body2" color="error">
                    {error}
                    </Typography>
                </Paper>
                )}

                {result && (
                <Fade in={true} timeout={600}>
                    <Paper elevation={4} sx={{ p: 2, borderRadius: 4, backgroundColor: "#f5f5f5", border: "2px solid #EB7333", position: "relative", "::before": { content: "''", position: "absolute", left: -10, top: 20, width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderRight: "10px solid #EE671E" } }} >
                    <Typography variant="body1">{result}</Typography>
                    </Paper>
                </Fade>
                )}

                {!loading && !result && !error && (
                <Typography variant="body2" color="text.secondary">
                    Seleccioná entre 2 y 3 propiedades para comparar.
                </Typography>
                )}
                </Box>
        )}
        </Box>
  );
};