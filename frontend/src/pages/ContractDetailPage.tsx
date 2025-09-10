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
  Divider,
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
import PaidIcon from '@mui/icons-material/Paid';
import ElectricalServicesOutlined from "@mui/icons-material/ElectricalServicesOutlined";
import ReceiptOutlined from "@mui/icons-material/ReceiptOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import { alpha } from "@mui/material/styles";

import BasePage from "./BasePage.tsx";
import { getContractById } from "../app/user/services/contract.service.ts";
import type { Contract, ContractDetail } from "../app/user/types/contract.ts";
import { ContractStatus } from "../app/user/types/contract.ts";
import { useContractNames } from "../app/user/hooks/contracts/useContractNames.ts";
import { useUtilityNames } from "../app/user/hooks/contracts/useUtilityNames.ts";
import { useAuthContext } from "../app/user/context/AuthContext.tsx";

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ContractDetail | null>(null);

  const { userName, propertyName } = useContractNames(
    contract?.userId ?? "",
    contract?.propertyId ?? 0
  );

  // Traigo contrato
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

  // Utilidades y nombres (hook en archivo aparte)
  const utilities = contract?.contractUtilities ?? [];
  const utilityNameMap = useUtilityNames(utilities);

  const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("es-AR") : "-";

  const fmtLongDate = (iso: string) => {
    const d = new Date(iso);
    const m = d.toLocaleString("es-AR", { month: "long" });
    return `${d.getDate()} de ${m.charAt(0).toUpperCase() + m.slice(1)} del ${d.getFullYear()}`;
  };

  const currencyLabel = (c?: string | null) => (c === "USD" ? "USD" : "ARS");
  const currencyPrefix = (c?: string | null) => (c === "USD" ? "USD $ " : "ARS $ ");
  const fmtMoney = (n?: number | null) =>
    n != null ? `${currencyPrefix(contract?.currency)}${n.toLocaleString("es-AR")}` : "-";

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

  const periodicityLabel = (p?: string | null) => {
    const map: Record<string, string> = {
      UNICO: "Único",
      MENSUAL: "Mensual",
      BIMENSUAL: "Bimensual",
      TRIMESTRAL: "Trimestral",
      SEMESTRAL: "Semestral",
      ANUAL: "Anual",
    };
    return (p && map[p]) || p || "-";
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

  // pre-cálculos seguros
  const guarantors = contract.guarantors ?? [];
  const commission = (contract as any).commission ?? null;

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
                    label={currencyLabel(contract.currency)}
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
                {isAdmin && (
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
                        fontSize: "0.875rem",
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
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: "0.875rem",
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
          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {/* Información Principal (solo admin) */}
            {isAdmin && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
                  <Typography sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}>
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
                        sx={{ fontSize: "1rem", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" }, color: "primary.main" }}
                      >
                        {propertyName || `Propiedad ${contract.propertyId}`}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Período del Contrato (todos) */}
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "text.secondary", fontWeight: 500 }}>
                      Desde:
                    </Typography>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                      {fmtLongDate(contract.startDate)}
                    </Typography>
                  </Box>

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

            {/* TENANT: Deposito al lado de periodo de contrato */}
            {!isAdmin && (
              <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={1}
                sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
              >
                <Typography
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}
                >
                    <PaidIcon />
                    Depósito
                  </Typography>

                  {contract.hasDeposit ? (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      {/* Monto del Depósito */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            mb: 0.5,
                            fontSize: "0.875rem",
                            color: "text.secondary",
                            fontWeight: 500,
                          }}
                        >
                          Monto del Depósito
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "warning.main",
                          }}
                        >
                          {fmtMoney(contract.depositAmount ?? 0)}
                        </Typography>
                      </Box>

                      {/* Nota del Depósito */}
                      {contract.depositNote && (
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              mb: 0.5,
                              fontSize: "0.875rem",
                              color: "text.secondary",
                              fontWeight: 500,
                            }}
                          >
                            Nota del Depósito
                          </Typography>
                          <Typography sx={{ fontSize: "1rem" }}>{contract.depositNote}</Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No hay depósitos registrados.</Typography>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Información Financiera (todos) */}
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
                        {fmtMoney(contract.initialAmount ?? 0)}
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
                          ? fmtMoney(contract.lastPaidAmount)
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

            {/* Garantes (todos) */}
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={1}
                sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
              >
                <Typography
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}
                >
                  <SecurityOutlined />
                  Garantes
                </Typography>

                {guarantors.length === 0 ? (
                  <Typography color="text.secondary">Sin garantes.</Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {guarantors.map((g, idx) => (
                      <Box
                        key={g.id ?? idx}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <PersonOutline fontSize="small" color="action" />
                          <Typography sx={{ fontWeight: 700 }}>{g.name}</Typography>
                        </Box>

                        <Typography sx={{ color: "text.secondary" }}>
                          <strong>Teléfono:</strong> {g.phone ?? "-"}
                        </Typography>
                        <Typography sx={{ color: "text.secondary" }}>
                          <strong>Email:</strong> {g.email ?? "-"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Depósito (todos) */}
            {isAdmin && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "grey.200",
                    height: "80%",
                    flex: 1,
                  }}
                >
                  <Typography
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "primary.main",
                    }}
                  >
                    <PaidIcon />
                    Depósito
                  </Typography>

                  {contract.hasDeposit ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box>
                        <Typography
                          sx={{
                            mb: 0.5,
                            fontSize: "0.875rem",
                            color: "text.secondary",
                            fontWeight: 500,
                          }}
                        >
                          Monto del Depósito
                        </Typography>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "warning.main" }}>
                          {fmtMoney(contract.depositAmount ?? 0)}
                        </Typography>
                      </Box>

                      {contract.depositNote && (
                        <Box>
                          <Typography
                            sx={{
                              mb: 0.5,
                              fontSize: "0.875rem",
                              color: "text.secondary",
                              fontWeight: 500,
                            }}
                          >
                            Nota del Depósito
                          </Typography>
                          <Typography sx={{ fontSize: "1rem" }}>{contract.depositNote}</Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No hay depósitos registrados.</Typography>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Comisión (solo admin) */}
            {isAdmin && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
                  elevation={1}
                  sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", height: "80%", flex: 1 }}
                >
                  <Typography
                    sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}
                  >
                    <ReceiptOutlined />
                    Comisión
                  </Typography>

                  {!commission ? (
                    <Typography color="text.secondary">Sin comisión registrada.</Typography>
                  ) : (
                    <>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <Box>
                            <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                              Moneda
                            </Typography>
                            <Typography sx={{ fontWeight: 700 }}>
                              {currencyLabel(commission.currency)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <Box>
                            <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                              Monto total
                            </Typography>
                            <Typography sx={{ fontWeight: 700 }}>
                              {commission.totalAmount}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <Box>
                            <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                              Fecha
                            </Typography>
                            <Typography sx={{ fontWeight: 700 }}>
                              {fmtDate(commission.date)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <Box>
                            <Typography sx={{ mb: 0.5, fontSize: ".875rem", color: "text.secondary", fontWeight: 500 }}>
                              Tipo / Cuotas
                            </Typography>
                            <Typography sx={{ fontWeight: 700 }}>
                              {commission.paymentType ?? "-"}{" "}
                              {commission.installments ? `(${commission.installments})` : ""}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={commission.status ?? "PENDIENTE"}
                          color={
                            commission.status === "PAGADA"
                              ? "success"
                              : commission.status === "PARCIAL"
                              ? "warning"
                              : "default"
                          }
                          sx={{ fontWeight: 600 }}
                        />
                        {commission.note && (
                          <Typography color="text.secondary">| {commission.note}</Typography>
                        )}
                      </Stack>
                    </>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Servicios / Expensas - detalle (todos) */}
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={1}
                sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
              >
                <Typography
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}
                >
                  <ElectricalServicesOutlined />
                  Servicios y Expensas
                </Typography>

                {utilities.length === 0 ? (
                  <Typography color="text.secondary">Sin utilidades asociadas.</Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {utilities.map((u, idx) => {
                      const resolvedName =
                        u.utility?.name ??
                        (u.utilityId != null ? utilityNameMap[u.utilityId] : undefined);

                      return (
                        <Box
                          key={u.id ?? idx}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "grey.200",
                          }}
                        >
                          {/* Primera línea: nombre + periodicidad */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            {(resolvedName || u.utilityId != null) && (
                              <Chip
                                size="small"
                                variant="outlined"
                                label={resolvedName ?? `ID ${u.utilityId}`}
                              />
                            )}
                            <Chip size="small" label={periodicityLabel(u.periodicity)} />
                          </Box>

                          {/* Campos verticales */}
                          <Stack spacing={0.5} sx={{ mt: 1 }}>
                            <Typography sx={{ color: "text.secondary" }}>
                              <strong>Monto inicial:</strong> {fmtMoney(u.initialAmount ?? 0)}
                            </Typography>

                            <Typography sx={{ color: "text.secondary" }}>
                              <strong>Último pago:</strong>{" "}
                              {u.lastPaidAmount != null ? fmtMoney(u.lastPaidAmount) : "-"}{" "}
                              {u.lastPaidDate && (
                                <Typography component="span" color="text.disabled">
                                  ({fmtDate(u.lastPaidDate)})
                                </Typography>
                              )}
                            </Typography>

                            {u.notes && (
                              <Typography sx={{ color: "text.secondary" }}>
                                <strong>Notas:</strong> {u.notes}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Notas (solo admin) */}
            {isAdmin && contract.note && (
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
