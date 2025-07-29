// import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
// import { useViewStats } from "../app/property/hooks/useViewsStats";
// import ChartCard from "../app/property/components/view/ChartCard";
// import { useNavigate } from "react-router-dom";
// import BasePage from "./BasePage";
// import ReplyIcon from '@mui/icons-material/Reply';

// export default function ViewStatsPage() {
//     const { stats, loading, error } = useViewStats();
//     const navigate = useNavigate();

//     if (loading)
//         return (
//             <Box display="flex" justifyContent="center" mt={4}>
//                 <CircularProgress />
//             </Box>
//         );
//     if (error)
//         return (
//             <Typography color="error" align="center" mt={4}>
//                 Error al cargar estadísticas: {error}
//             </Typography>
//         );

//     // Definimos un array con título + datos para iterar
//     const charts = [
//         { title: "Vistas por Propiedad", data: stats.property },
//         { title: "Vistas por Tipo de Propiedad", data: stats.propertyType },
//         { title: "Vistas por Día", data: stats.day },
//         { title: "Vistas por Mes", data: stats.month },
//         { title: "Vistas por Barrio", data: stats.neighborhood },
//         { title: "Vistas por Tipo de Barrio", data: stats.neighborhoodType },
//         { title: "Vistas por Estado", data: stats.status },
//         { title: "Vistas por Operación", data: stats.operation },
//         { title: "Vistas por Habitaciones", data: stats.rooms },
//         { title: "Vistas por Amenidad", data: stats.amenity },
//     ];

//     return (
//         <>
//             <IconButton
//                 size="small"
//                 onClick={() => navigate(-1)}
//                 sx={{ position: 'absolute', top: 64, left: 8, zIndex: 1300 }}
//             >
//                 <ReplyIcon />
//             </IconButton>

//             <BasePage>

//                 <Box
//                     p={2}
//                     display="grid"
//                     gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
//                     gap={2}
//                 >
//                     {charts.map((c, i) => (
//                         <ChartCard key={i} title={c.title} data={c.data} />
//                     ))}
//                 </Box>
//             </BasePage>
//         </>
//     );
// }
