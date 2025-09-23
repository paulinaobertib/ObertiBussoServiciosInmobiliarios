import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

interface ChartCardProps {
    title: string;
    data: Record<string | number, number>;
}

export default function ChartCard({ title, data }: ChartCardProps) {
    const theme = useTheme();
    const categories = Object.keys(data || {});
    const values = Object.values(data || {});
    const hasData = categories.length > 0 && values.some((value) => Number(value) > 0);

    return (
        <Card
            elevation={1}
            sx={{
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                },
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
                <Box width="100%" height={200} display="flex" alignItems="center" justifyContent="center">
                    {hasData ? (
                        <BarChart
                            height={180}
                            series={[{ data: values }]}
                            xAxis={[
                                {
                                    data: categories,
                                    scaleType: 'band',
                                },
                            ]}
                        />
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Sin datos disponibles
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
