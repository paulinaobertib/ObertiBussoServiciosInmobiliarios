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
                    <Grid container spacing={3}>
                        {categories.includes('views') &&
                            [
                                { title: 'Vistas por Día', data: stats.day },
                                { title: 'Vistas por Mes', data: stats.month },
                                { title: 'Vistas por Operación', data: stats.operation },
                            ].map((cfg, i) => (
                                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ChartCard title={cfg.title} data={cfg.data} />
                                </Grid>
                            ))}

                        {categories.includes('inquiry') &&
                            [
                                {
                                    title: 'Consultas por Mes',
                                    data: stats.inquiriesPerMonth,
                                },
                                {
                                    title: 'Prop. Más Consultadas',
                                    data: stats.mostConsultedProperties,
                                },
                            ].map((cfg, i) => (
                                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ChartCard title={cfg.title} data={cfg.data} />
                                </Grid>
                            ))}

                        {categories.includes('survey') &&
                            [
                                {
                                    title: 'Distribución Puntajes Encuestas',
                                    data: stats.surveyScoreDistribution,
                                },
                                {
                                    title: 'Puntaje Diario Prom.',
                                    data: stats.surveyDailyAverageScore,
                                },
                            ].map((cfg, i) => (
                                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ChartCard title={cfg.title} data={cfg.data} />
                                </Grid>
                            ))}
                    </Grid>
                )}
            </Box>
        </BasePage>
    );
}