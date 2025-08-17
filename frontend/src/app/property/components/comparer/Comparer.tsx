import { useEffect, useState } from "react";
import { useComparerProperty } from "../../hooks/useComparer";
import { PropertyDTOAI } from "../../types/property";
import { Box, CircularProgress, Typography, Paper, Fade, Fab, useTheme, Tooltip } from "@mui/material";
import houseIcon from "../../../../assets/ic_casa2.png"

type Props = {
  data: PropertyDTOAI[];
};

const bubbleBase = {
  p: 2,
  borderRadius: 2,
  border: "2px solid #EB7333",
  position: "relative" as const,
  maxWidth: { xs: "100%", sm: "70%" },
  wordBreak: "break-word" as const,
  "&::before": {
    content: '""',
    position: "absolute",
    width: 0,
    height: 0,

    // Flecha
    bottom: { xs: -20, sm: 20 },
    left: { xs: 14, sm: -20 },

    borderLeft: { xs: "10px solid transparent", sm: "10px solid transparent" },
    borderRight: { xs: "10px solid transparent", sm: "10px solid #EE671E" },
    borderTop: { xs: "10px solid #EE671E", sm: "10px solid transparent" },
    borderBottom: { xs: "10px solid transparent", sm: "10px solid transparent" },
  },
} as const;

export const Comparer = ({ data }: Props) => {
  const { compare, loading, result, error } = useComparerProperty();
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (data.length >= 2 && data.length <= 3) {
      compare(data);
    }
  }, [data]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column-reverse", sm: "row" },
        alignItems: { xs: "flex-start", sm: "flex-end" },
        gap: 2,
      }}
    >
      <Tooltip title={'Comparación'} arrow>

        <Fab onClick={() => setOpen((o) => !o)}
          sx={{
            bgcolor: "#EE671E",
            width: { xs: "3.5rem" },
            height: { xs: "3.5rem" },
            cursor: "pointer",
            userSelect: "none",
            '&:hover': { bgcolor: theme.palette.primary.dark },
          }}
        >
          <img src={houseIcon} alt="House" style={{ width: '2.2rem', height: '2.2rem' }} />
        </Fab>
      </Tooltip>

      {open && (
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {loading && (
            <Paper
              sx={{
                ...bubbleBase,
                backgroundColor: "#EB7333",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} sx={{ color: "#FED7AA" }} />
                <Typography sx={{ color: "#FED7AA", fontSize: { xs: "1rem", sm: "0.9rem" } }}>Estoy analizando las propiedades...</Typography>
              </Box>
            </Paper>
          )}

          {error && (
            <Paper sx={{ p: 2, borderRadius: 4, border: "2px solid red", backgroundColor: "#ffe5e5" }} >
              <Typography color="error" sx={{ fontSize: { xs: "1rem", sm: "0.9rem" } }}>
                {error}
              </Typography>
            </Paper>
          )}

          {result && (
            <Fade in timeout={600}>
              <Paper
                sx={{
                  ...bubbleBase,
                  backgroundColor: "#f5f5f5",
                }}
              >
                <Typography sx={{ fontSize: { xs: "1rem", sm: "0.9rem" } }}>
                  {result}
                </Typography>
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