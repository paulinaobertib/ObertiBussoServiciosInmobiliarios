import {
  Card, CardHeader, CardContent, CardActions, Typography, Chip, Box, Button, Divider
} from "@mui/material";
import PersonOutline from "@mui/icons-material/PersonOutline";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { useNavigate } from "react-router-dom";
import { useContractNames } from "../../hooks/contracts/useContractNames";
import { buildRoute, ROUTES } from "../../../../lib";
import type { Contract } from "../../types/contract";

const typeLabel = (t?: Contract["contractType"]) => {
  if (!t) return "";
  const map: Record<string, string> = {
    VIVIENDA: "Vivienda",
    RESIDENCIAL: "Vivienda",
    COMERCIAL: "Comercial",
    TEMPORAL: "Temporal",
  };
  return map[t] ?? t.charAt(0) + t.slice(1).toLowerCase();
};

interface Props {
  contract: Contract;
  onDelete: (c: Contract) => void;
  onToggleStatus: (c: Contract) => void;
  isAdmin?: boolean;
}

export const ContractItem = ({ contract }: Props) => {
  const navigate = useNavigate();
  
  const { userName, propertyName } = useContractNames(
    contract.userId,
    contract.propertyId
  );

  const fmtLongDate = (iso: string) => {
    const d = new Date(iso);
    const m = d.toLocaleString("es-AR", { month: "long" });
    return `${d.getDate()} de ${m.charAt(0).toUpperCase() + m.slice(1)} del ${d.getFullYear()}`;
  };
  const fmtShortDate = (iso: string) => new Date(iso).toLocaleDateString("es-AR");

  const lastAmount = contract.lastPaidAmount ?? null;
  const lastDate = contract.lastPaidDate ? fmtShortDate(contract.lastPaidDate) : null;

  const goDetail = () => {
    // ahora todos van a la misma ruta de detalle
    navigate(buildRoute(ROUTES.CONTRACT_DETAIL, contract.id));
  };

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 3,
        boxShadow: 5,
        transition: "box-shadow .25s ease",
        "&:hover": { boxShadow: 15 },
        maxWidth: 600,
        minHeight: 300,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        mx: "auto",
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.75 }}>
              {contract.contractType && (
                <Chip
                  size="small"
                  label={typeLabel(contract.contractType)}
                  sx={{
                    height: 22,
                    bgcolor: "white",
                    color: "grey.700",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "grey.300",
                    fontSize: "0.75rem",
                  }}
                />
              )}
              <Chip
                size="small"
                label={contract.contractStatus}
                sx={{
                  height: 22,
                  bgcolor: contract.contractStatus === "ACTIVO" ? "#82eba8ff" : "#f8a5a5ff",
                  color: "white",
                  borderRadius: 2,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <Typography component="span" noWrap sx={{ fontWeight: 700, fontSize: "1.125rem" }}>
                Contrato de
              </Typography>
              <Typography component="span" noWrap sx={{ fontWeight: 600 }}>
                {userName || "Cargando..."}
              </Typography>
              <PersonOutline fontSize="small" />
            </Box>
          </Box>
        }
        sx={{ "& .MuiCardHeader-content": { minWidth: 0 }, pb: 0.5 }}
      />

      <CardContent sx={{ pt: 1, flexGrow: 1 }}>
        <Box sx={{ display: "grid", gap: 1.25, fontSize: "0.8125rem" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <HomeOutlined fontSize="small" />
            <Typography component="span" fontWeight={500} color="text.secondary" fontSize="0.9375rem">
              Propiedad:
            </Typography>
            <Typography component="span" color="text.primary" noWrap fontSize="0.9375rem">
              {propertyName || "Cargando..."}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, color: "text.secondary" }}>
            <CalendarMonthOutlined fontSize="small" sx={{ mt: 0.2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography component="span" fontWeight={500} color="text.secondary" fontSize="0.9375rem">
                Período:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, ml: 1 }}>
                <Typography component="span" color="text.primary" fontSize="0.9375rem">
                  <strong>Desde:</strong> {fmtLongDate(contract.startDate)}
                </Typography>
                <Typography component="span" color="text.primary" fontSize="0.9375rem">
                  <strong>Hasta:</strong> {fmtLongDate(contract.endDate)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <AttachMoneyOutlined fontSize="small" />
            <Typography component="span" fontWeight={500} color="text.secondary" fontSize="0.9375rem">
              Último pago:
            </Typography>

            {lastAmount !== null ? (
              <>
                <Typography component="span" color="text.primary" fontWeight={700} fontSize="0.9375rem">
                  ARS $ {Number(lastAmount).toLocaleString("es-AR")}
                </Typography>
                {lastDate && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 0.5, fontSize: "0.8125rem" }}
                  >
                    ({lastDate})
                  </Typography>
                )}
              </>
            ) : (
              <Typography component="span" color="text.secondary" fontSize="0.8125rem">
                Sin registros
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>

      <Divider />

      <CardActions
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: "grey.50",
          borderTop: "1px solid",
          borderColor: "grey.100",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          color="warning"
          size="small"
          startIcon={<VisibilityOutlined />}
          onClick={goDetail}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.75rem",
            minHeight: 28,
            px: 1,
            borderRadius: 3,
            boxShadow: 1,
            "& .MuiButton-startIcon": { mr: 0.5 },
            "&:hover": { boxShadow: 3 },
          }}
        >
          Ver detalles
        </Button>
      </CardActions>
    </Card>
  );
};
