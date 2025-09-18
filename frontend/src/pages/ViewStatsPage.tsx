import React, { useState, useMemo } from 'react';
import { Box, Grid, Typography, Paper, CircularProgress, Alert, IconButton, useTheme } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PollIcon from '@mui/icons-material/Poll';

import StatsFilters from '../app/property/components/view/StatsFilters';
import ChartCard from '../app/property/components/view/ChartCard';
import { useViewStats } from '../app/property/hooks/useViewsStats';
import BasePage from './BasePage';

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
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
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

export default function ViewStatsPage() {
    const { stats, loading, error } = useViewStats();
    const [categories, setCategories] = useState<('views' | 'inquiry' | 'survey')[]>([
        'views',
        'inquiry',
        'survey',
    ]);

    // Cálculo de métricas resumidas
    const totalViews = useMemo(
        () =>
            Object.values(stats.day || {}).reduce(
                (sum, v) => sum + (v as number),
                0
            ),
        [stats.day]
    );
    const daysCount = useMemo(
        () => Object.keys(stats.day || {}).length || 1,
        [stats.day]
    );
    const avgViewsPerDay = Math.round(totalViews / daysCount);

    const topViewsByProperty = useMemo(() => pickTopEntries(stats.property, 8), [stats.property]);
    const topViewsByPropertyType = useMemo(() => pickTopEntries(stats.propertyType, 8), [stats.propertyType]);
    const topViewsByNeighborhood = useMemo(() => pickTopEntries(stats.neighborhood, 8), [stats.neighborhood]);
    const topViewsByNeighborhoodType = useMemo(
        () => pickTopEntries(stats.neighborhoodType, 8),
        [stats.neighborhoodType]
    );
    const topViewsByStatus = useMemo(() => pickTopEntries(stats.status, 8), [stats.status]);
    const topViewsByOperation = useMemo(() => pickTopEntries(stats.operation, 6), [stats.operation]);
    const topViewsByRooms = useMemo(() => pickTopEntries(stats.rooms, 6), [stats.rooms]);
    const topViewsByAmenity = useMemo(() => pickTopEntries(stats.amenity, 8), [stats.amenity]);
    const topViewsByStatusAndType = useMemo(
        () => pickTopEntries(flattenStatusAndType(stats.statusAndType), 10),
        [stats.statusAndType]
    );

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
    const inquiriesPerMonth = useMemo(
        () => pickTopEntries(stats.inquiriesPerMonth, 12),
        [stats.inquiriesPerMonth]
    );
    const mostConsultedProperties = useMemo(
        () => pickTopEntries(stats.mostConsultedProperties, 8),
        [stats.mostConsultedProperties]
    );

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

    return (
        <BasePage>
            <Box sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ position: 'relative', mb: 3 }}>
                    <IconButton
                        onClick={() => window.history.back()}
                        sx={{ position: 'absolute', top: 0, left: 0 }}
                    >
                        <ReplyIcon />
                    </IconButton>

                    <Typography
                        variant="h4"
                        align="center"
                        sx={{ fontWeight: 700, letterSpacing: 1 }}
                    >
                        Dashboard de Estadísticas
                    </Typography>
                </Box>

                {/* Filtros de categoría */}
                <Box mb={4}>
                    <StatsFilters selected={categories} onChange={setCategories} />
                </Box>

                {/* Resúmenes numéricos */}
                <Grid container spacing={3} mb={4}>
                    {categories.includes('views') && (
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
                    {categories.includes('inquiry') && (
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
                    {categories.includes('survey') && (
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
                        {categories.includes('views') && (
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                    Vistas de Propiedades
                                </Typography>
                                <Grid container spacing={3}>
                                    {[
                                        { title: 'Por Día', data: stats.day },
                                        { title: 'Por Mes', data: stats.month },
                                        { title: 'Top Propiedades', data: topViewsByProperty },
                                        { title: 'Por Tipo', data: topViewsByPropertyType },
                                        { title: 'Por Barrio', data: topViewsByNeighborhood },
                                        { title: 'Tipo de Barrio', data: topViewsByNeighborhoodType },
                                        { title: 'Por Estado', data: topViewsByStatus },
                                        { title: 'Estado y Tipo', data: topViewsByStatusAndType },
                                        { title: 'Por Operación', data: topViewsByOperation },
                                        { title: 'Por Ambientes', data: topViewsByRooms },
                                        { title: 'Por Amenidad', data: topViewsByAmenity },
                                    ].map((cfg) => (
                                        <Grid key={cfg.title} size={{ xs: 12, sm: 6, md: 4 }}>
                                            <ChartCard title={cfg.title} data={cfg.data} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {categories.includes('inquiry') && (
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                    Consultas
                                </Typography>
                                <Grid container spacing={3}>
                                    {[
                                        { title: 'Consultas por Mes', data: inquiriesPerMonth },
                                        { title: 'Propiedades Más Consultadas', data: mostConsultedProperties },
                                        { title: 'Distribución por Estado', data: inquiryStatusDistribution },
                                        { title: 'Por Día de la Semana', data: inquiriesByDayOfWeek },
                                        { title: 'Por Franja Horaria', data: inquiriesByTimeRange },
                                    ].map((cfg) => (
                                        <Grid key={cfg.title} size={{ xs: 12, sm: 6, md: 4 }}>
                                            <ChartCard title={cfg.title} data={cfg.data} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {categories.includes('survey') && (
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                    Encuestas
                                </Typography>
                                <Grid container spacing={3}>
                                    {[
                                        { title: 'Distribución de Puntajes', data: surveyScoreDistribution },
                                        { title: 'Puntaje Promedio Diario', data: surveyDailyAverage },
                                        { title: 'Puntaje Promedio Mensual', data: surveyMonthlyAverage },
                                    ].map((cfg) => (
                                        <Grid key={cfg.title} size={{ xs: 12, sm: 6, md: 4 }}>
                                            <ChartCard title={cfg.title} data={cfg.data} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </BasePage>
    );
}
