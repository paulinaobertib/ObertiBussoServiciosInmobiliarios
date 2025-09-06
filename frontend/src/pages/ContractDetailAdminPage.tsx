import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ReplyIcon from "@mui/icons-material/Reply";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import SecurityOutlined from "@mui/icons-material/SecurityOutlined";
import ElectricalServicesOutlined from "@mui/icons-material/ElectricalServicesOutlined";
import StickyNote2Outlined from "@mui/icons-material/StickyNote2Outlined";
import ReceiptOutlined from "@mui/icons-material/ReceiptOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import { alpha } from "@mui/material/styles";

import BasePage from "./BasePage.tsx";
import { getContractById } from "../app/user/services/contract.service.ts";
import type { Contract, ContractDetail } from "../app/user/types/contract.ts";
import { ContractStatus } from "../app/user/types/contract.ts";
import { useContractNames } from "../app/user/hooks/contracts/useContractNames.ts";
import { useAuthContext } from "../app/user/context/AuthContext.tsx";

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin: showAdmin } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ContractDetail | null>(null);

  const { userName, propertyName } = useContractNames(
    contract?.userId ?? "",
    contract?.propertyId ?? 0
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!id) return;
        const resp = await getContractById(Number(id));
        const data = (resp as any)?.data ?? resp;
        if (alive) setContract(data as ContractDetail);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("es-AR") : "-";

  const fmtLongDate = (iso: string) => {
    const d = new Date(iso);
    const m = d.toLocaleString("es-AR", { month: "long" });
    return `${d.getDate()} de ${m.charAt(0).toUpperCase() + m.slice(1)} del ${d.getFullYear()}`;
  };

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

  // --- acciones admin ---
  const onEdit = () => {
    if (!contract) return;
    navigate(`/contracts/${contract.id}/edit`);
  };

  const onToggleStatus = () => {
    if (!contract) return;
    setContract((prev) =>
      prev
        ? {
            ...prev,
            contractStatus:
              prev.contractStatus === ContractStatus.ACTIVO
                ? ContractStatus.INACTIVO
                : ContractStatus.ACTIVO,
          }
        : prev
    );
  };

  const onDelete = () => {
    if (!contract) return;
    if (window.confirm("¿Eliminar el contrato? Esta acción no se puede deshacer.")) {
      navigate("/contracts");
    }
  };

  const onPayments = () => {
    if (!contract) return;
    navigate(`/contracts/${contract.id}/payments`);
  };

  const onIncrease = () => {
    if (!contract) return;
    navigate(`/contracts/${contract.id}/increase`);
  };

  if (loading) {
    return (
      <BasePage>
        <Container sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      </BasePage>
    );
  }

  if (!contract) {
    return (
      <BasePage>
        <Container sx={{ py: 6 }}>
          <Typography sx={{ fontSize: "1rem" }}>No se encontró el contrato.</Typography>
        </Container>
      </BasePage>
    );
  }

  const propertyHref = `/properties/${contract.propertyId}`;
  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 64, left: 8, zIndex: 3000 }}
      >
        <ReplyIcon />
      </IconButton>

      <BasePage>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Encabezado */}
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
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    />
                  )}
                  <Chip
                    size="medium"
                    label={contract.currency ?? "ARS"}
                    sx={{
                      bgcolor: "white",
                      color: "grey.700",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "grey.300",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  />
                  <Chip
                    size="medium"
                    label={contract.contractStatus}
                    sx={{
                      bgcolor:
                        contract.contractStatus === "ACTIVO" ? "#82eba8ff" : "#f8a5a5ff",
                      color: "white",
                      borderRadius: 2,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </Box>

              {/* Acciones admin */}
              <Stack direction="column" spacing={1} alignItems="flex-end">
                {showAdmin && (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Editar" placement="top">
                      <IconButton
                        size="small"
                        onClick={onEdit}
                        sx={{ "&:hover": { bgcolor: "primary.50", color: "primary.main" } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      title={contract.contractStatus === "ACTIVO" ? "Inactivar" : "Reactivar"}
                      placement="top"
                    >
                      <IconButton
                        size="small"
                        onClick={onToggleStatus}
                        sx={{ "&:hover": { bgcolor: "warning.50", color: "warning.main" } }}
                      >
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar" placement="top">
                      <IconButton
                        size="small"
                        onClick={onDelete}
                        sx={{ "&:hover": { bgcolor: "error.50", color: "error.main" } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                {showAdmin && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PaymentsOutlined />}
                      onClick={onPayments}
                      sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, fontSize: "0.875rem",   
                        "&:hover": (theme) => ({
                        bgcolor: alpha(theme.palette.warning.main, 0.12),
                        borderColor: theme.palette.warning.dark,
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
                      sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, fontSize: "0.875rem",
                        "&:hover": (theme) => ({
                        bgcolor: alpha(theme.palette.warning.main, 0.12),
                        borderColor: theme.palette.warning.dark,
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

          {/* GRID */}
          <Grid container spacing={3}>
            {/* Información Principal */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={1}
                sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
              >
                <Typography
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}
                >
                  <AccountCircleOutlined />
                  Información Principal
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonOutline fontSize="small" color="action" />
                    <Typography sx={{ fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                      Usuario:
                    </Typography>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                      {userName || contract.userId}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <HomeOutlined fontSize="small" color="action" />
                    <Typography sx={{ fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                      Propiedad:
                    </Typography>
                    <Typography
                      component={Link}
                      to={propertyHref}
                      sx={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                        color: "primary.main",
                      }}
                    >
                      {propertyName || `Propiedad ${contract.propertyId}`}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Período del Contrato */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={1}
                sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
              >
                <Typography
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}
                >
                  <CalendarMonthOutlined />
                  Período del Contrato
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Inicio */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                      Desde:
                    </Typography>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                      {fmtLongDate(contract.startDate)}
                    </Typography>
                  </Box>

                  {/* Fin */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                      Hasta:
                    </Typography>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                      {fmtLongDate(contract.endDate)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Información Financiera */}
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={1}
                sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
              >
                <Typography
                  sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}
                >
                  <AttachMoneyOutlined />
                  Información Financiera
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                      <Typography sx={{ mb: 0.5, fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                        Monto Inicial
                      </Typography>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "success.main" }}>
                        $ {(contract.initialAmount ?? 0).toLocaleString("es-AR")}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                      <Typography sx={{ mb: 0.5, fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                        Último Pago (Monto)
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: contract.lastPaidAmount != null ? "success.main" : "text.secondary",
                        }}
                      >
                        {contract.lastPaidAmount != null
                          ? `$ ${contract.lastPaidAmount.toLocaleString("es-AR")}`
                          : "Sin registros"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                      <Typography sx={{ mb: 0.5, fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                        Último Pago (Fecha)
                      </Typography>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                        {fmtDate(contract.lastPaidDate)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                      <Typography sx={{ mb: 0.5, fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                        Frecuencia de Ajuste
                      </Typography>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                        {contract.adjustmentFrequencyMonths ?? "-"} meses
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {contract.adjustmentIndex && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography sx={{ mb: 0.5, fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                      Índice de Ajuste
                    </Typography>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                      {contract.adjustmentIndex.code} - {contract.adjustmentIndex.name}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Depósito */}
            {contract.hasDeposit && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
                  elevation={1}
                  sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
                >
                  <Typography
                    sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}
                  >
                    <SecurityOutlined />
                    Depósito
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                      <Typography sx={{ mb: 0.5, fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                        Monto del Depósito
                      </Typography>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "warning.main" }}>
                        {contract.depositAmount ?? "-"}
                      </Typography>
                    </Box>

                    {contract.depositNote && (
                      <Box>
                        <Typography sx={{ mb: 0.5, fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                          Nota del Depósito
                        </Typography>
                        <Typography sx={{ fontSize: "1rem" }}>{contract.depositNote}</Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Información Adicional */}
            <Grid size={{ xs: 12, md: contract.hasDeposit ? 6 : 12 }}>
              <Paper
                elevation={1}
                sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
              >
                <Typography
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}
                >
                  <StickyNote2Outlined />
                  Información Adicional
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <SecurityOutlined fontSize="small" color="action" />
                    <Box>
                      <Typography sx={{ fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                        Garantes
                      </Typography>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                        {contract.guarantors?.length
                          ? `${contract.guarantors.length} garante(s)`
                          : "Sin garantes"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <ElectricalServicesOutlined fontSize="small" color="action" />
                    <Box>
                      <Typography sx={{ fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                        Utilidades
                      </Typography>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                        {contract.contractUtilities?.length
                          ? `${contract.contractUtilities.length} utilidad(es)`
                          : "Sin utilidades"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <ReceiptOutlined fontSize="small" color="action" />
                    <Box>
                      <Typography sx={{ fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                        Pagos Registrados
                      </Typography>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                        {contract.payments?.length
                          ? `${contract.payments.length} pago(s)`
                          : "Sin pagos registrados"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Notas */}
            {contract.note && (
              <Grid size={{ xs: 12 }}>
                <Paper
                  elevation={1}
                  sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", bgcolor: "grey.50" }}
                >
                  <Typography sx={{ mb: 2, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}>
                    Notas del Contrato
                  </Typography>
                  <Typography sx={{ fontSize: "1rem", lineHeight: 1.6 }}>
                    {contract.note}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>
      </BasePage>
    </>
  );
}
