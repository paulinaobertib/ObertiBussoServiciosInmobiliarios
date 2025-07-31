// src/pages/ViewStatsPage.tsx
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { useViewStats } from "../app/property/hooks/useViewsStats";
import ChartCard from "../app/property/components/view/ChartCard";
import { useNavigate } from "react-router-dom";
import BasePage from "./BasePage";
import ReplyIcon from "@mui/icons-material/Reply";

export default function ViewStatsPage() {
    const { stats, loading, error } = useViewStats();
    const navigate = useNavigate();

    if (loading)
        return (
            <BasePage>
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            </BasePage>
        );
    if (error)
        return (
            <BasePage>
                <Typography color="error" align="center" mt={4}>
                    Error al cargar estadísticas: {error}
                </Typography>
            </BasePage>
        );

    // — VISTAS —
    const viewCharts = [
        { title: "Vistas por Propiedad", data: stats.property },
        { title: "Vistas por Tipo de Propiedad", data: stats.propertyType },
        { title: "Vistas por Día", data: stats.day },
        { title: "Vistas por Mes", data: stats.month },
        { title: "Vistas por Barrio", data: stats.neighborhood },
        { title: "Vistas por Tipo de Barrio", data: stats.neighborhoodType },
        { title: "Vistas por Estado", data: stats.status },
        { title: "Vistas por Operación", data: stats.operation },
        { title: "Vistas por Habitaciones", data: stats.rooms },
        { title: "Vistas por Amenidad", data: stats.amenity },
    ];

    // — CONSULTAS —
    const inquiryCharts = [
        {
            title: "Distribución de Estados de Consulta",
            data: stats.inquiryStatusDistribution,
        },
        {
            title: "Consultas por Día de la Semana",
            data: stats.inquiriesByDayOfWeek,
        },
        {
            title: "Consultas por Franja Horaria",
            data: stats.inquiriesByTimeRange,
        },
        {
            title: "Consultas por Mes",
            data: stats.inquiriesPerMonth,
        },
        {
            title: "Propiedades Más Consultadas",
            data: stats.mostConsultedProperties,
        },
    ];

    // — ENCUESTAS —
    const surveyCharts = [
        {
            title: "Distribución de Puntajes de Encuestas",
            data: stats.surveyScoreDistribution,
        },
        {
            title: "Puntaje Promedio Diario de Encuestas",
            data: stats.surveyDailyAverageScore,
        },
        {
            title: "Puntaje Promedio Mensual de Encuestas",
            data: stats.surveyMonthlyAverageScore,
        },
    ];

    return (
        <>
            <IconButton
                size="small"
                onClick={() => navigate(-1)}
                sx={{ position: "absolute", top: 64, left: 8, zIndex: 1300 }}
            >
                <ReplyIcon />
            </IconButton>

            <BasePage>
                {/* Resúmenes numéricos */}
                <Box p={2} textAlign="center" gap={1} display="flex" flexDirection="column">
                    <Typography variant="h6">
                        Tiempo promedio de respuesta: {stats.inquiryResponseTime}
                    </Typography>
                    <Typography variant="h6">Total de encuestas: {stats.surveysCount}</Typography>
                    <Typography variant="h6">
                        Puntaje promedio de encuestas: {stats.averageSurveyScore}
                    </Typography>
                </Box>

                {/* Grid de todos los ChartCard */}
                <Box
                    p={2}
                    display="grid"
                    gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                    gap={2}
                >
                    {viewCharts.map((c, i) => (
                        <ChartCard key={`view-${i}`} title={c.title} data={c.data} />
                    ))}
                    {inquiryCharts.map((c, i) => (
                        <ChartCard key={`inquiry-${i}`} title={c.title} data={c.data} />
                    ))}
                    {surveyCharts.map((c, i) => (
                        <ChartCard key={`survey-${i}`} title={c.title} data={c.data} />
                    ))}
                </Box>
            </BasePage>
        </>
    );
}
