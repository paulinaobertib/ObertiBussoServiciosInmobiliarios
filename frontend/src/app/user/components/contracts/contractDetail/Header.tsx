import { Box, Stack, Chip, Typography, IconButton, Tooltip, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import { alpha } from "@mui/material/styles";
import { typeLabel, currencyLabel } from "./utils";
import type { ContractDetail } from "../../../types/contract";

type Props = {
  contract: ContractDetail;
  isAdmin: boolean;
  savingStatus: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onPayments: () => void;
  onIncrease: () => void;
};

export default function Header({
  contract,
  isAdmin,
  savingStatus,
  onEdit,
  onDelete,
  onToggleStatus,
  onPayments,
  onIncrease,
}: Props) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: "2rem" }}>
            Detalle de Contrato
          </Typography>

          <Stack direction="row" spacing={1}>
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
                  fontSize: ".875rem",
                  fontWeight: 500,
                }}
              />
            )}
            <Chip
              size="medium"
              label={currencyLabel(contract.currency)}
              sx={{
                bgcolor: "white",
                color: "grey.700",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.300",
                fontSize: ".875rem",
                fontWeight: 500,
              }}
            />
            <Chip
              size="medium"
              label={contract.contractStatus}
              sx={{
                bgcolor: contract.contractStatus === "ACTIVO" ? "#82eba8ff" : "#f8a5a5ff",
                color: "white",
                borderRadius: 2,
                fontSize: ".875rem",
                fontWeight: 600,
              }}
            />
          </Stack>
        </Box>

        <Stack direction="column" spacing={1} alignItems="flex-end">
          {isAdmin && (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Editar">
                <span>
                  <IconButton
                    size="small"
                    onClick={onEdit}
                    sx={{ "&:hover": { bgcolor: "primary.50", color: "primary.main" } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={contract.contractStatus === "ACTIVO" ? "Inactivar" : "Reactivar"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={onToggleStatus}
                    disabled={savingStatus}
                    sx={{ "&:hover": { bgcolor: "warning.50", color: "warning.main" } }}
                  >
                    <BlockIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Eliminar">
                <span>
                  <IconButton
                    size="small"
                    onClick={onDelete}
                    sx={{ "&:hover": { bgcolor: "error.50", color: "error.main" } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}

          {isAdmin && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PaymentsOutlined />}
                onClick={onPayments}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: ".875rem",
                  "&:hover": (t) => ({
                    bgcolor: alpha(t.palette.warning.main, 0.12),
                    borderColor: t.palette.warning.dark,
                  }),
                }}
              >
                Pagos
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<TrendingUpOutlined />}
                onClick={onIncrease}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: ".875rem",
                  "&:hover": (t) => ({
                    bgcolor: alpha(t.palette.warning.main, 0.12),
                    borderColor: t.palette.warning.dark,
                  }),
                }}
              >
                Aumentos
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
