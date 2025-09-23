import { Box, Stack, Chip, Typography, Button } from "@mui/material";
import { typeLabel } from "./utils";
import type { ContractGet } from "../../../types/contract";
import { LoadingButton } from "@mui/lab";

type Props = {
  contract: ContractGet;
  isAdmin: boolean;
  savingStatus: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onPayments: () => void;
  onIncrease: () => void;
};

export default function Header({ contract, isAdmin, savingStatus, onEdit, onDelete, onToggleStatus }: Props) {
  return (
    <Box sx={{ my: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontSize: "1.5rem" }}>
            Detalle de Contrato
          </Typography>
          {contract.contractType && (
            <Chip
              size="medium"
              label={typeLabel(contract.contractType)}
              sx={{
                bgcolor: "white",
                color: "grey.700",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.300",
                fontSize: "0.9rem",
                fontWeight: 600,
                height: 30,
              }}
            />
          )}
          <Chip
            size="medium"
            label={contract.contractStatus}
            sx={{
              bgcolor: contract.contractStatus === "ACTIVO" ? "#82eba8ff" : "#f8a5a5ff",
              color: "white",
              borderRadius: 2,
              fontSize: "0.9rem",
              fontWeight: 700,
              height: 30,
            }}
          />
        </Box>

        <Stack direction="column" spacing={0.5} alignItems="flex-end">
          {isAdmin && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" variant="outlined" onClick={onEdit}>
                Editar
              </Button>
              <LoadingButton
                size="small"
                variant="outlined"
                color={contract.contractStatus === "ACTIVO" ? "warning" : "success"}
                onClick={onToggleStatus}
                disabled={savingStatus}
                loading={savingStatus}
              >
                {contract.contractStatus === "ACTIVO" ? "Inactivar" : "Reactivar"}
              </LoadingButton>
              <Button size="small" variant="outlined" color="error" onClick={onDelete}>
                Eliminar 
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
