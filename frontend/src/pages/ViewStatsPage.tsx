import React, { useState, useMemo } from "react";
import { Box, Grid, Typography, Paper, CircularProgress, Alert, IconButton, useTheme } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PollIcon from "@mui/icons-material/Poll";
import GavelIcon from "@mui/icons-material/Gavel";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { AttachMoney } from "@mui/icons-material";

import StatsFilters from "../app/property/components/view/StatsFilters";
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
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      {icon}
      <Box ml={2}>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
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

export default function ViewStatsPage() {
  const { stats, loading, error } = useViewStats();
  const [categories, setCategories] = useState<("views" | "inquiry" | "survey" | "contract")[]>([
    "views",
    "inquiry",
    "survey",
    "contract",
  ]);

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
  const topViewsByAmenity = useMemo(() => pickTopEntries(stats.amenity, 8), [stats.amenity]);
  const topViewsByStatusAndType = useMemo(
    () => pickTopEntries(flattenStatusAndType(stats.statusAndType), 10),
    [stats.statusAndType]
  );
  const viewCharts = [
    { title: "Por Día", data: stats.day, type: "bar" as const },
    { title: "Por Mes", data: stats.month, type: "doughnut" as const },
    { title: "Top Propiedades", data: topViewsByProperty, type: "bar" as const },
    { title: "Por Tipo", data: topViewsByPropertyType, type: "pie" as const },
    { title: "Por Barrio", data: topViewsByNeighborhood, type: "pie" as const },
    { title: "Tipo de Barrio", data: topViewsByNeighborhoodType, type: "doughnut" as const },
    { title: "Por Estado", data: topViewsByStatus, type: "doughnut" as const },
    { title: "Estado y Tipo", data: topViewsByStatusAndType, type: "bar" as const },
    { title: "Por Operación", data: topViewsByOperation, type: "pie" as const },
    { title: "Por Ambientes", data: topViewsByRooms, type: "bar" as const },
    { title: "Por Amenidad", data: topViewsByAmenity, type: "bar" as const },
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
    <BasePage>
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ position: "relative", mb: 3 }}>
          <IconButton onClick={() => window.history.back()} sx={{ position: "absolute", top: 0, left: 0 }}>
            <ReplyIcon />
          </IconButton>

          <Typography variant="h4" align="center" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Dashboard de Estadísticas
          </Typography>
        </Box>

        {/* Filtros de categoría */}
        <Box mb={4}>
          <StatsFilters selected={categories} onChange={setCategories} />
        </Box>

        {/* Resúmenes numéricos */}
        <Grid container spacing={3} mb={4}>
          {categories.includes("views") && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<VisibilityIcon fontSize="large" color="primary" />}
                  title="Total de Vistas"
                  value={totalViews.toLocaleString()}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<VisibilityIcon fontSize="large" color="secondary" />}
                  title="Vistas Promedio/Día"
                  value={avgViewsPerDay.toLocaleString()}
                />
              </Grid>
            </>
          )}

          {categories.includes("inquiry") && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoCard
                icon={<AccessTimeIcon fontSize="large" color="warning" />}
                title="Tiempo Prom. Respuesta (h)"
                value={
                  stats.inquiryResponseTime && !isNaN(Number(stats.inquiryResponseTime))
                    ? Number(stats.inquiryResponseTime).toFixed(2)
                    : "0.00"
                }
              />
            </Grid>
          )}

          {categories.includes("survey") && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<PollIcon fontSize="large" color="success" />}
                  title="Total de Encuestas"
                  value={stats.surveysCount}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<PollIcon fontSize="large" color="error" />}
                  title="Puntaje Prom. Encuestas"
                  value={stats.averageSurveyScore.toFixed(2)}
                />
              </Grid>
            </>
          )}

          {/* --- KPIs de Contratos --- */}
          {categories.includes("contract") && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<GavelIcon fontSize="large" color="primary" />}
                  title="Total Contratos"
                  value={totalContracts}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<GavelIcon fontSize="large" color="success" />}
                  title="Contratos Activos"
                  value={activeContracts}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<GavelIcon fontSize="large" color="error" />}
                  title="Contratos Inactivos"
                  value={inactiveContracts}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<MonetizationOnIcon fontSize="large" color="primary" />}
                  title="Comisiones (Rango Seleccionado)"
                  value={totalCommissionInRangeMoney}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<MonetizationOnIcon fontSize="large" color="success" />}
                  title="Comisiones Pagadas (Total $)"
                  value={formatMoney(commissionTotalsByStatus["PAGADA"] || 0, currencySymbol)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<MonetizationOnIcon fontSize="large" color="warning" />}
                  title="Comisiones Parciales (Total $)"
                  value={formatMoney(commissionTotalsByStatus["PARCIAL"] || 0, currencySymbol)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<MonetizationOnIcon fontSize="large" color="error" />}
                  title="Comisiones Pendientes (Total $)"
                  value={formatMoney(commissionTotalsByStatus["PENDIENTE"] || 0, currencySymbol)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<MonetizationOnIcon fontSize="large" color="primary" />}
                  title="Pagos Totales (rango)"
                  value={paymentsTotal.toLocaleString()}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<AttachMoney fontSize="large" color="success" />}
                  title="Pagos por Contrato (rango)"
                  value={paymentsByContractRangeCount}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<AttachMoney fontSize="large" color="warning" />}
                  title="Pagos por Comisión (rango)"
                  value={paymentsByCommissionRangeCount}
                />
              </Grid>
              {/* Si querés mostrar utilities */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoCard
                  icon={<AttachMoney fontSize="large" color="secondary" />}
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
            {categories.includes("views") && (
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

            {categories.includes("inquiry") && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Consultas
                </Typography>
                <Grid container spacing={3}>
                  {[
                    { title: "Consultas por Mes", data: inquiriesPerMonth, type: "line" },
                    { title: "Propiedades Más Consultadas", data: mostConsultedProperties, type: "bar" },
                    { title: "Distribución por Estado", data: inquiryStatusDistribution, type: "doughnut" },
                    { title: "Por Día de la Semana", data: inquiriesByDayOfWeek, type: "pie" },
                    { title: "Por Franja Horaria", data: inquiriesByTimeRange, type: "bar" },
                  ].map((cfg) => (
                    <Grid key={cfg.title} size={{ xs: 12, sm: 6, md: 4 }}>
                      <ChartCard title={cfg.title} data={cfg.data} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {categories.includes("survey") && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Encuestas
                </Typography>
                <Grid container spacing={3}>
                  {[
                    { title: "Distribución de Puntajes", data: surveyScoreDistribution, type: "bar" },
                    { title: "Puntaje Promedio Diario", data: surveyDailyAverage, type: "line" },
                    { title: "Puntaje Promedio Mensual", data: surveyMonthlyAverage, type: "doughnut" },
                  ].map((cfg) => (
                    <Grid key={cfg.title} size={{ xs: 12, sm: 6, md: 4 }}>
                      <ChartCard title={cfg.title} data={cfg.data} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* --- Sección Contratos --- */}
            {categories.includes("contract") && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Contratos
                </Typography>

                {/* --- KPIs de Payments dentro de la sección Contratos --- */}
                <Grid container spacing={3} mb={2}></Grid>

                {/* Gráficos de Contratos + Payments + Comisiones */}
                <Grid container spacing={3}>
                  {/* Lo que ya tenías */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ChartCard title="Contratos por Estado" data={topContractsByStatus} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ChartCard title="Contratos por Tipo" data={topContractsByType} />
                  </Grid>

                  {/* Payments */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ChartCard title="Pagos por Concepto (rango)" data={paymentsByConcept} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ChartCard title="Pagos por Moneda (rango)" data={paymentsByCurrency} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 8 }}>
                    <ChartCard title="Pagos por Mes (rango)" data={paymentsMonthlyTotals} />
                  </Grid>

                  {/* (Opcional) Comisiones – útiles si querés ver todo “económico” en la pestaña Contratos */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ChartCard title="Comisiones por Estado" data={commissionTotalsByStatus} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ChartCard title="Comisiones por Mes" data={commissionYearMonthlyTotals} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ChartCard title="Cantidad de Comisiones por Estado" data={commissionCountsByStatus} />
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
  );
}
