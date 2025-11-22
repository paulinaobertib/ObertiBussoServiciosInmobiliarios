import React, { useState, useMemo, useCallback, ChangeEvent } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  Stack,
  TextField,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ReplyIcon from "@mui/icons-material/Reply";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PollIcon from "@mui/icons-material/Poll";
import GavelIcon from "@mui/icons-material/Gavel";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import { useNavigate } from "react-router-dom";

import ChartCard from "../app/property/components/view/ChartCard";
import { useViewStats } from "../app/property/hooks/useViewsStats";
import BasePage from "./BasePage";

interface InfoCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function InfoCard({ title, value, icon }: InfoCardProps) {
  const theme = useTheme();
  const iconWrapperBg = alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.12 : 0.24);
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1.5,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: iconWrapperBg,
            color: theme.palette.primary.main,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.4 }}>
          {title}
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1.1 }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </Typography>
      </Box>
    </Paper>
  );
}

const pickTopEntries = (data: Record<string | number, number> | undefined, limit = 8): Record<string, number> => {
  if (!data) return {};
  return Object.entries(data)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, limit)
    .reduce<Record<string, number>>((acc, [key, value]) => {
      acc[String(key)] = Number(value);
      return acc;
    }, {});
};

const flattenStatusAndType = (data: Record<string, Record<string, number>> | undefined): Record<string, number> => {
  if (!data) return {};
  const flattened: Record<string, number> = {};
  Object.entries(data).forEach(([status, typeMap]) => {
    Object.entries(typeMap || {}).forEach(([type, value]) => {
      flattened[`${status} · ${type}`] = Number(value);
    });
  });
  return flattened;
};

// Util para dinero (ajusta currency si lo pasás desde el hook como opción)
const formatMoney = (amount: number, currency: "ARS" | "USD" = "ARS") =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(amount || 0);

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const getInitialRange = () => {
  const now = new Date();
  return {
    from: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: toIsoDate(now),
  };
};

const parseDurationToHours = (value: string | number | null | undefined) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    const timeParts = normalized.match(/\d+/g)?.map((part) => Number(part) || 0);
    if (timeParts && timeParts.length >= 4 && normalized.includes("día")) {
      const [days = 0, hours = 0, minutes = 0, seconds = 0] = timeParts;
      return days * 24 + hours + minutes / 60 + seconds / 3600;
    }
    const segments = value.split(":").map((segment) => Number(segment));
    if (segments.length === 3 && segments.every((num) => !Number.isNaN(num))) {
      const [hours, minutes, seconds] = segments;
      return hours + minutes / 60 + seconds / 3600;
    }
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }
  return 0;
};

export default function ViewStatsPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(getInitialRange);
  const commissionYear = useMemo(() => {
    const parsed = Number.parseInt(dateRange.to.slice(0, 4), 10);
    if (Number.isNaN(parsed)) {
      return new Date().getFullYear();
    }
    return parsed;
  }, [dateRange.to]);

  const { stats, loading, error } = useViewStats({
    commissions: {
      from: dateRange.from,
      to: dateRange.to,
      year: commissionYear,
    },
    payments: {
      from: dateRange.from,
      to: dateRange.to,
    },
  });

  const [activeSection, setActiveSection] = useState<"views" | "inquiry" | "survey" | "finances">("views");

  const handleDateChange = useCallback(
    (field: "from" | "to") => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (!value) return;
      setDateRange((prev) => {
        const next = { ...prev, [field]: value };
        if (next.from > next.to) {
          if (field === "from") {
            next.to = value;
          } else {
            next.from = value;
          }
        }
        return next;
      });
    },
    []
  );

  // --- VISTAS ---
  const totalViews = useMemo(
    () => Object.values(stats.day || {}).reduce((sum, v) => sum + (v as number), 0),
    [stats.day]
  );
  const daysCount = useMemo(() => Object.keys(stats.day || {}).length || 1, [stats.day]);
  const avgViewsPerDay = Math.round(totalViews / daysCount);

  const topViewsByProperty = useMemo(() => pickTopEntries(stats.property, 8), [stats.property]);
  const topViewsByPropertyType = useMemo(() => pickTopEntries(stats.propertyType, 8), [stats.propertyType]);
  const topViewsByNeighborhood = useMemo(() => pickTopEntries(stats.neighborhood, 8), [stats.neighborhood]);
  const topViewsByNeighborhoodType = useMemo(() => pickTopEntries(stats.neighborhoodType, 8), [stats.neighborhoodType]);
  const topViewsByStatus = useMemo(() => pickTopEntries(stats.status, 8), [stats.status]);
  const topViewsByOperation = useMemo(() => pickTopEntries(stats.operation, 6), [stats.operation]);
  const topViewsByRooms = useMemo(() => pickTopEntries(stats.rooms, 6), [stats.rooms]);
  const topViewsByAmenity = useMemo(() => pickTopEntries(stats.amenity, 5), [stats.amenity]);
  const topViewsByStatusAndType = useMemo(
    () => pickTopEntries(flattenStatusAndType(stats.statusAndType), 10),
    [stats.statusAndType]
  );
  const viewsByDayDescending = useMemo(() => {
    if (!stats.day) return {};
    return Object.entries(stats.day)
      .sort(([, a], [, b]) => Number(b ?? 0) - Number(a ?? 0))
      .reduce<Record<string, number>>((acc, [key, value]) => {
        acc[String(key)] = Number(value ?? 0);
        return acc;
      }, {});
  }, [stats.day]);
  const viewCharts = [
    { title: "Vistas por día", data: viewsByDayDescending, type: "bar" as const },
    { title: "Vistas por mes", data: stats.month, type: "doughnut" as const },
    { title: "Propiedades con más vistas", data: topViewsByProperty, type: "pie" as const },
    { title: "Vistas por tipo de propiedad", data: topViewsByPropertyType, type: "pie" as const },
    { title: "Vistas por barrio", data: topViewsByNeighborhood, type: "pie" as const },
    { title: "Vistas por tipo de barrio", data: topViewsByNeighborhoodType, type: "doughnut" as const },
    { title: "Vistas por estado", data: topViewsByStatus, type: "doughnut" as const },
    { title: "Vistas por estado y tipo", data: topViewsByStatusAndType, type: "bar" as const },
    { title: "Vistas por tipo de operación", data: topViewsByOperation, type: "pie" as const },
    { title: "Vistas por ambientes", data: topViewsByRooms, type: "bar" as const },
    { title: "Características más consultadas", data: topViewsByAmenity, type: "bar" as const },
  ] as const;

  // --- CONSULTAS ---
  const inquiryStatusDistribution = useMemo(
    () => pickTopEntries(stats.inquiryStatusDistribution, 10),
    [stats.inquiryStatusDistribution]
  );
  const inquiriesByDayOfWeek = useMemo(
    () => pickTopEntries(stats.inquiriesByDayOfWeek, 7),
    [stats.inquiriesByDayOfWeek]
  );
  const inquiriesByTimeRange = useMemo(
    () => pickTopEntries(stats.inquiriesByTimeRange, 6),
    [stats.inquiriesByTimeRange]
  );
  const inquiriesPerMonth = useMemo(() => pickTopEntries(stats.inquiriesPerMonth, 12), [stats.inquiriesPerMonth]);
  const mostConsultedProperties = useMemo(
    () => pickTopEntries(stats.mostConsultedProperties, 8),
    [stats.mostConsultedProperties]
  );

  // --- ENCUESTAS ---
  const surveyScoreDistribution = useMemo(
    () => pickTopEntries(stats.surveyScoreDistribution, 10),
    [stats.surveyScoreDistribution]
  );
  const surveyDailyAverage = useMemo(
    () => pickTopEntries(stats.surveyDailyAverageScore, 10),
    [stats.surveyDailyAverageScore]
  );
  const surveyMonthlyAverage = useMemo(
    () => pickTopEntries(stats.surveyMonthlyAverageScore, 12),
    [stats.surveyMonthlyAverageScore]
  );

  // --- CONTRATOS ---
  const totalContracts = useMemo(
    () => Object.values(stats.contractStatus || {}).reduce((sum, v) => sum + Number(v || 0), 0),
    [stats.contractStatus]
  );
  const activeContracts = useMemo(
    () => Number(stats.contractStatus?.ACTIVO ?? stats.contractStatus?.Activo ?? 0),
    [stats.contractStatus]
  );
  const inactiveContracts = useMemo(
    () => Number(stats.contractStatus?.INACTIVO ?? stats.contractStatus?.Inactivo ?? 0),
    [stats.contractStatus]
  );
  const topContractsByStatus = useMemo(() => pickTopEntries(stats.contractStatus, 10), [stats.contractStatus]);
  const topContractsByType = useMemo(() => pickTopEntries(stats.contractType, 10), [stats.contractType]);

  // --- COMISIONES (NUEVO) ---
  // Si tu hook recibe la currency, podés derivarla acá para el símbolo. De momento, ARS por defecto:
  const currencySymbol: "ARS" | "USD" = "ARS";
  const commissionTotalsByStatus = useMemo(() => {
    const src = stats.commissionsTotalByStatus || {};
    // Aseguro objeto plano string->number
    return Object.entries(src).reduce<Record<string, number>>((acc, [k, v]) => {
      acc[String(k)] = Number(v || 0);
      return acc;
    }, {});
  }, [stats.commissionsTotalByStatus]);

  const commissionCountsByStatus = useMemo(
    () => pickTopEntries(stats.commissionsCountByStatus, 3),
    [stats.commissionsCountByStatus]
  );
  //   const commissionCountsByPaymentType = useMemo(
  //     () => pickTopEntries(stats.commissionsCountByPaymentType, 2),
  //     [stats.commissionsCountByPaymentType]
  //   );
  const commissionYearMonthlyTotals = useMemo(
    () => pickTopEntries(stats.commissionsYearMonthlyTotals, 12),
    [stats.commissionsYearMonthlyTotals]
  );

  const totalCommissionInRangeMoney = useMemo(
    () => formatMoney(stats.commissionsTotalInDateRange || 0, currencySymbol),
    [stats.commissionsTotalInDateRange, currencySymbol]
  );

  const averageInquiryResponseHours = useMemo(
    () => parseDurationToHours(stats.inquiryResponseTime),
    [stats.inquiryResponseTime]
  );
  const averageInquiryResponseLabel = useMemo(() => {
    const raw = stats.inquiryResponseTime;
    if (typeof raw === "string" && /día|hora|minuto|segundo/.test(raw.toLowerCase())) {
      return raw;
    }
    const hours = averageInquiryResponseHours;
    if (!hours) return "0 h";
    const totalMinutes = Math.round(hours * 60);
    const days = Math.floor(totalMinutes / (24 * 60));
    const hoursPart = Math.floor((totalMinutes - days * 24 * 60) / 60);
    const minutesPart = totalMinutes % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days} día${days !== 1 ? "s" : ""}`);
    if (hoursPart) parts.push(`${hoursPart} h`);
    if (minutesPart && parts.length < 2) parts.push(`${minutesPart} min`);
    return parts.join(" ") || "0 h";
  }, [stats.inquiryResponseTime, averageInquiryResponseHours]);

  // --- PAYMENTS ---
  const paymentsTotal = useMemo(() => Number(stats.paymentsTotalInDateRange || 0), [stats.paymentsTotalInDateRange]);
  const paymentsByConcept = useMemo(
    () => Object.fromEntries(Object.entries(stats.paymentsCountByConcept || {}).sort((a, b) => b[1] - a[1])),
    [stats.paymentsCountByConcept]
  );
  const paymentsByCurrency = useMemo(() => ({ ...stats.paymentsCountByCurrency }), [stats.paymentsCountByCurrency]);
  const paymentsMonthlyTotals = useMemo(() => ({ ...stats.paymentsMonthlyTotals }), [stats.paymentsMonthlyTotals]);

  const paymentsByContractRangeCount = stats.paymentsByContractRangeCount ?? 0;
  const paymentsByCommissionRangeCount = stats.paymentsByCommissionRangeCount ?? 0;
  const paymentsByUtilityRangeCount = stats.paymentsByUtilityRangeCount ?? 0;

  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 64, left: 8, zIndex: 1300, display: { xs: "none", sm: "inline-flex" } }}
      >
        <ReplyIcon />
      </IconButton>
      <BasePage>
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" align="center" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              Panel de estadísticas
            </Typography>
          </Box>

          {/* Tabs de navegación */}
          <Box mb={4}>
            <Tabs
              value={activeSection}
              onChange={(_, newValue) => setActiveSection(newValue)}
              centered
              TabIndicatorProps={{ sx: { height: 4, borderRadius: 999, bgcolor: "primary.main" } }}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                maxWidth: 520,
                mx: "auto",
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  minWidth: "auto",
                  px: { xs: 1, sm: 2.5 },
                },
                "& .MuiTab-root.Mui-selected": {
                  color: "primary.main",
                },
              }}
            >
              <Tab label="Vistas" value="views" />
              <Tab label="Consultas" value="inquiry" />
              <Tab label="Encuestas" value="survey" />
              <Tab label="Finanzas" value="finances" />
            </Tabs>
          </Box>

          {/* Filtro de rango de fechas (solo en Finanzas) */}
          {activeSection === "finances" && (
            <Box mb={4}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Rango de fechas para comisiones y pagos
                </Typography>
                <Divider />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                  <TextField
                    label="Desde"
                    type="date"
                    value={dateRange.from}
                    onChange={handleDateChange("from")}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: { xs: "100%", sm: 220 } }}
                  />
                  <TextField
                    label="Hasta"
                    type="date"
                    value={dateRange.to}
                    onChange={handleDateChange("to")}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: { xs: "100%", sm: 220 } }}
                  />
                </Stack>
              </Paper>
            </Box>
          )}

          {/* Resúmenes numéricos */}
          <Grid container spacing={3} mb={4}>
            {activeSection === "views" && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <InfoCard
                    icon={<VisibilityIcon fontSize="large" color="inherit" />}
                    title="Total de Vistas"
                    value={totalViews}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <InfoCard
                    icon={<VisibilityIcon fontSize="large" color="inherit" />}
                    title="Vistas promedio por día"
                    value={avgViewsPerDay}
                  />
                </Grid>
              </>
            )}

            {activeSection === "inquiry" && (
              <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                <InfoCard
                  icon={<AccessTimeIcon fontSize="large" color="inherit" />}
                  title="Tiempo promedio de respuesta"
                  value={averageInquiryResponseLabel}
                />
              </Grid>
            )}

            {activeSection === "survey" && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <InfoCard
                    icon={<PollIcon fontSize="large" color="inherit" />}
                    title="Total de Encuestas"
                    value={stats.surveysCount}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <InfoCard
                    icon={<PollIcon fontSize="large" color="inherit" />}
                    title="Puntaje Prom. Encuestas"
                    value={`${stats.averageSurveyScore.toFixed(2)} / 5`}
                  />
                </Grid>
              </>
            )}

            {/* --- KPIs de Finanzas --- */}
            {activeSection === "finances" && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoCard
                    icon={<GavelIcon fontSize="large" color="inherit" />}
                    title="Total Contratos"
                    value={totalContracts}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoCard
                    icon={<GavelIcon fontSize="large" color="inherit" />}
                    title="Contratos Activos"
                    value={activeContracts}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoCard
                    icon={<GavelIcon fontSize="large" color="inherit" />}
                    title="Contratos Inactivos"
                    value={inactiveContracts}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoCard
                    icon={<MonetizationOnIcon fontSize="large" color="inherit" />}
                    title="Comisiones totales en el rango"
                    value={totalCommissionInRangeMoney}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoCard
                    icon={<MonetizationOnIcon fontSize="large" color="inherit" />}
                    title="Comisiones Pagadas (Total $)"
                    value={formatMoney(commissionTotalsByStatus["PAGADA"] || 0, currencySymbol)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoCard
                    icon={<MonetizationOnIcon fontSize="large" color="inherit" />}
                    title="Comisiones Parciales (Total $)"
                    value={formatMoney(commissionTotalsByStatus["PARCIAL"] || 0, currencySymbol)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoCard
                    icon={<MonetizationOnIcon fontSize="large" color="inherit" />}
                    title="Comisiones Pendientes (Total $)"
                    value={formatMoney(commissionTotalsByStatus["PENDIENTE"] || 0, currencySymbol)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoCard
                    icon={<MonetizationOnIcon fontSize="large" color="inherit" />}
                    title="Pagos totales en el rango"
                    value={paymentsTotal}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoCard
                    icon={<AttachMoneyIcon fontSize="large" color="inherit" />}
                    title="Pagos asociados a contratos (rango)"
                    value={paymentsByContractRangeCount}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoCard
                    icon={<AttachMoneyIcon fontSize="large" color="inherit" />}
                    title="Pagos asociados a comisiones (rango)"
                    value={paymentsByCommissionRangeCount}
                  />
                </Grid>
                {/* Si querés mostrar utilities */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoCard
                    icon={<AttachMoneyIcon fontSize="large" color="inherit" />}
                    title="Pagos de Servicios (rango)"
                    value={paymentsByUtilityRangeCount}
                  />
                </Grid>
              </>
            )}
          </Grid>

          {/* Carga / Error */}
          {loading && (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          )}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Grilla de gráficos */}
          {!loading && !error && (
            <Box display="flex" flexDirection="column" gap={4}>
              {activeSection === "views" && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Vistas de Propiedades
                  </Typography>
                  <Grid container spacing={3}>
                    {viewCharts.map((cfg) => (
                      <Grid key={cfg.title} size={{ xs: 12, sm: 6, md: 4 }}>
                        <ChartCard title={cfg.title} data={cfg.data} type={cfg.type} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {activeSection === "inquiry" && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Consultas
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      { title: "Consultas por Mes", data: inquiriesPerMonth, type: "line" as const },
                      { title: "Propiedades Más Consultadas", data: mostConsultedProperties, type: "pie" as const },
                      { title: "Distribución por Estado", data: inquiryStatusDistribution, type: "doughnut" as const },
                      { title: "Por Día de la Semana", data: inquiriesByDayOfWeek, type: "pie" as const },
                      { title: "Por Franja Horaria", data: inquiriesByTimeRange, type: "bar" as const },
                    ].map((cfg) => (
                      <Grid key={cfg.title} size={{ xs: 12, sm: 6, md: 4 }}>
                        <ChartCard title={cfg.title} data={cfg.data} type={cfg.type} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {activeSection === "survey" && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Encuestas
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      { title: "Distribución de Puntajes", data: surveyScoreDistribution, type: "bar" as const },
                      { title: "Puntaje Promedio Diario", data: surveyDailyAverage, type: "line" as const },
                      { title: "Puntaje Promedio Mensual", data: surveyMonthlyAverage, type: "doughnut" as const },
                    ].map((cfg) => (
                      <Grid key={cfg.title} size={{ xs: 12, sm: 6, md: 4 }}>
                        <ChartCard title={cfg.title} data={cfg.data} type={cfg.type} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* --- Sección Finanzas --- */}
              {activeSection === "finances" && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Finanzas
                  </Typography>

                  {/* --- KPIs de Payments dentro de la sección Contratos --- */}
                  <Grid container spacing={3} mb={2}></Grid>

                  {/* Gráficos de Contratos + Payments + Comisiones */}
                  <Grid container spacing={3}>
                    {/* Lo que ya tenías */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <ChartCard title="Contratos por estado" data={topContractsByStatus} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <ChartCard title="Contratos por tipo" data={topContractsByType} />
                    </Grid>

                    {/* Payments */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <ChartCard title="Pagos por concepto (rango)" data={paymentsByConcept} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <ChartCard title="Pagos por moneda (rango)" data={paymentsByCurrency} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 8 }}>
                      <ChartCard title="Pagos por mes (rango)" data={paymentsMonthlyTotals} />
                    </Grid>

                    {/* (Opcional) Comisiones – útiles si querés ver todo “económico” en la pestaña Contratos */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <ChartCard title="Comisiones por estado" data={commissionTotalsByStatus} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <ChartCard title="Comisiones por mes" data={commissionYearMonthlyTotals} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <ChartCard title="Cantidad de comisiones por estado" data={commissionCountsByStatus} />
                    </Grid>
                    {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}> */}
                    {/* <ChartCard title="Comisiones por Tipo de Pago" data={commissionsCountByPaymentType} />  */}
                    {/* </Grid> */}
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </BasePage>
    </>
  );
}
