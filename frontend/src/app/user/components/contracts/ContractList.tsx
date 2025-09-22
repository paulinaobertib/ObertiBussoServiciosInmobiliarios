import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useAuthContext } from "../../context/AuthContext";
import { ContractItem } from "./ContractItem";
import type { Contract } from "../../types/contract";

interface Props {
  contracts: Contract[];
}

export const ContractList = ({ contracts = [] }: Props) => {
  const { isAdmin } = useAuthContext();
  const safeContracts = Array.isArray(contracts) ? contracts : [];

  const sorted = useMemo(() => {
    return [...safeContracts].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [safeContracts]);

  if (sorted.length === 0) {
    return (
      <Typography align="center" sx={{ mt: 4, color: "#000", fontWeight: 500 }}>
        No hay contratos disponibles.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        // centra todo el bloque en la pantalla
        mx: "auto",
        // límite de ancho para que el grid no se “estire” infinito y quede centrado
        maxWidth: 1200,
        px: { xs: 1, sm: 2 },
        // GRID layout
        display: "grid",
        gap: 4,
        // columnas con mismo ancho por breakpoint
        gridTemplateColumns: {
          xs: "repeat(1, minmax(320px, 1fr))",
          sm: "repeat(2, minmax(360px, 1fr))",
          lg: "repeat(3, minmax(360px, 1fr))",
        },
        // que cada ítem llene su track (ancho/alto)
        justifyContent: "center",
        justifyItems: "stretch",
        alignItems: "stretch",
      }}
    >
      {sorted.map((c) => (
        <Box
          key={c.id}
          sx={{
            // evita que el contenido fuerce el ancho
            minWidth: 0,
            // hace que el hijo (Card) pueda ocupar todo el alto del ítem
            display: "flex",
          }}
        >
          <ContractItem contract={c} isAdmin={isAdmin} />
        </Box>
      ))}
    </Box>
  );
};
