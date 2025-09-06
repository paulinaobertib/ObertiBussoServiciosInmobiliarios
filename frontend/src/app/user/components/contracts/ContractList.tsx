import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useAuthContext } from "../../context/AuthContext";
import { ContractItem } from "./ContractItem";
import type { Contract } from "../../types/contract";

interface Props {
  contracts: Contract[];
  onDelete: (c: Contract) => void;
  onToggleStatus: (c: Contract) => void;
}

export const ContractList = ({
  contracts = [],
  onDelete,
  onToggleStatus,
}: Props) => {
  const { isAdmin } = useAuthContext();
  const safeContracts = Array.isArray(contracts) ? contracts : [];
  const sorted = useMemo(() => {
    return [...safeContracts].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [safeContracts]);

  if (sorted.length === 0) {
    return (
      <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
        No hay contratos.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 0, sm: 2 },
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",            // 1 columna
          sm: "repeat(2, 1fr)", // 2 columnas
          lg: "repeat(3, 1fr)", // 3 columnas
        },
        gap: 4,
      }}
    >
      {sorted.map((c) => (
        <Box key={c.id} sx={{ display: "flex", justifyContent: "center" }}>
          <ContractItem
            contract={c}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            isAdmin={isAdmin}
          />
        </Box>
      ))}
    </Box>
  );
};
