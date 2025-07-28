import { Card, CardContent, Typography, Box } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

interface ChartCardProps {
    title: string;
    data: Record<string | number, number>;
}

export default function ChartCard({ title, data }: ChartCardProps) {
    // Extraemos etiquetas y valores
    const categories = Object.keys(data);
    const values = Object.values(data);

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Box width="100%" height={240}>
                    <BarChart
                        // Altura interna del gráfico (ancho 100% del Box)
                        height={200}
                        // Le pasamos la serie de datos
                        series={[{ data: values }]}
                        // Configuramos el eje X con escala de bandas y nuestras categorías
                        xAxis={[{ data: categories, scaleType: "band" }]}
                    />
                </Box>
            </CardContent>
        </Card>
    );
}
